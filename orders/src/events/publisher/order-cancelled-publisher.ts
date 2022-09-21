import { Publisher, OrderCancelledEvent, Topics } from '@ticket-hub/common';

/**
 * Custom event publisher
 */
export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  topic: Topics.OrderCancelled = Topics.OrderCancelled;
}
