import { Listener, OrderCreatedEvent, Topics } from '@ticket-hub/common';
import { Message } from 'node-nats-streaming';

import { SERVICE_NAME } from '../../enums/constants';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  topic: Topics.OrderCreated = Topics.OrderCreated;
  queueGroupName = SERVICE_NAME;

  /**
   * This event is listening to orders service
   * When a ticket is booked here it will be blocked
   * @param data - Order data
   * @param payload - Message from NATS objetc
   */
  async onMessage(data: OrderCreatedEvent['data'], payload: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    await expirationQueue.add({ orderId: data.id }, { delay });

    console.log(`Service: ${SERVICE_NAME} - Waiting this many milliseconds to process the job: ${delay}`);
    payload.ack();
  }
}
