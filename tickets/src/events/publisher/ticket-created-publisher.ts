import { Publisher, TicketCreatedEvent, Topics } from '@ticket-hub/common';

/**
 * Custom event publisher
 */
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  topic: Topics.TicketCreated = Topics.TicketCreated;
}
