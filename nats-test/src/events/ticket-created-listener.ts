import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent, Topics } from '@ticket-hub/common';
import { Listener } from '@ticket-hub/common';

/**
 * Custom event listener
 */
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  topic: Topics.TicketCreated = Topics.TicketCreated;
  queueGroupName = 'tickets-service';

  onMessage(data: TicketCreatedEvent['data'], payload: Message) {
    console.log('Event data, received! Business logic is executing', data);
    payload.ack();
  }
}
