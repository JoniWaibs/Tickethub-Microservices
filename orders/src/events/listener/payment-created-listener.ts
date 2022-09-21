import { Message } from 'node-nats-streaming';
import { Listener, OrderStatus, PaymentCreatedEvent, Topics } from '@ticket-hub/common';

import { SERVICE_NAME } from '../../enums/constants';
import { Order } from '../../models';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  topic: Topics.PaymentCreated = Topics.PaymentCreated;
  queueGroupName = SERVICE_NAME;

  /**
   * This event is kept listening to the payments service
   * @param data - Ticket data
   * @param payload - Message from NATS objetc
   */
  async onMessage(data: PaymentCreatedEvent['data'], payload: Message) {
    const { orderId } = data;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }
    order.set({
      status: OrderStatus.COMPLETE,
    });

    console.log(`Service: ${SERVICE_NAME} - PaymentCreatedListener - Event received and business logic was processed`);
    payload.ack();
  }
}
