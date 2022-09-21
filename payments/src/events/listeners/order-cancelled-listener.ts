import { Listener, NotFoundError, OrderCancelledEvent, OrderStatus, Topics } from '@ticket-hub/common';
import { Message } from 'node-nats-streaming';

import { SERVICE_NAME } from '../../enums/constants';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  topic: Topics.OrderCancelled = Topics.OrderCancelled;
  queueGroupName = SERVICE_NAME;

  /**
   * This event is listening to orders service
   * When order is cancelled the ticket will be updated and unblocked
   * @param data - Order data
   * @param payload - Message from NATS objetc
   */
  async onMessage(data: OrderCancelledEvent['data'], payload: Message) {
    const { id: orderId, version } = data;

    const order = await Order.findOne({
      id: orderId,
      version: version - 1,
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    order.set({ status: OrderStatus.CANCELLED });
    const orderUpdated = await order.save();

    console.log(
      `Service: ${SERVICE_NAME} - OrderCancelledListener - Event received and business logic was processed, ${JSON.stringify(
        orderUpdated
      )}`
    );
    payload.ack();
  }
}
