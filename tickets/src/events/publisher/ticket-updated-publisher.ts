import { Publisher, TicketUpdatedEvent, Topics } from '@ticket-hub/common';

/**
 * Custom event publisher
 */
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  topic: Topics.TicketUpdated = Topics.TicketUpdated;
}
