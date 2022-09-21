import { Message } from 'node-nats-streaming';
import { Listener, NotFoundError, ExpirationCompleteEvent, Topics, OrderStatus } from '@ticket-hub/common';

import { SERVICE_NAME } from '../../enums/constants';
import { Order } from '../../models';
import { OrderCancelledPublisher } from '../publisher/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  topic: Topics.ExpirationComplete = Topics.ExpirationComplete;
  queueGroupName = SERVICE_NAME;

  /**
   * This event updates an associated order status
   * @param data - Order data
   * @param payload - Message from NATS objetc
   */
  async onMessage(data: ExpirationCompleteEvent['data'], payload: Message) {
    const { orderId } = data;
    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      return payload.ack();
    }

    order.set({ status: OrderStatus.CANCELLED });
    const orderUpdated = await order.save();

    /**
     * Emit event to topic: order:cancelled
     */
    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: orderUpdated.id,
      version: orderUpdated.version,
      ticket: {
        id: orderUpdated.ticket.id,
        price: orderUpdated.ticket.price,
      },
    });

    console.log(
      `Service: ${SERVICE_NAME} - ExpirationCompleteListener - Event received and business logic was processed`
    );
    payload.ack();
  }
}
