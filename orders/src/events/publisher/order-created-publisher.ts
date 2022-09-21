import { Publisher, OrderCreatedEvent, Topics } from '@ticket-hub/common';

/**
 * Custom event publisher
 */
export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  topic: Topics.OrderCreated = Topics.OrderCreated;
}
