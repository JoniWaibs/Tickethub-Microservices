import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Topics } from '@ticket-hub/common';
import { SERVICE_NAME } from '../../enums/constants';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  topic: Topics.OrderCreated = Topics.OrderCreated;
  queueGroupName = SERVICE_NAME;

  /**
   * This event is kept listening to the orders service
   * When a new order is created it is also saved in this service
   * @param data - order data
   * @param payload - Message from NATS objetc
   */
  async onMessage(data: OrderCreatedEvent['data'], payload: Message) {
    const { id: orderId, ticket, userId, version, status } = data;

    const order = new Order({
      _id: orderId,
      price: ticket.price,
      status: status,
      userId: userId,
      version: version,
    });
    await order.save();

    console.log(
      `Service: ${SERVICE_NAME} - OrderCreatedListener - Event received and business logic was processed, ${JSON.stringify(
        order
      )}`
    );
    payload.ack();
  }
}
