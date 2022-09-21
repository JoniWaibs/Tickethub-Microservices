import { Message } from 'node-nats-streaming';
import { Listener, TicketCreatedEvent, Topics } from '@ticket-hub/common';

import { SERVICE_NAME } from '../../enums/constants';
import { Ticket } from '../../models';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  topic: Topics.TicketCreated = Topics.TicketCreated;
  queueGroupName = SERVICE_NAME;

  /**
   * This event is kept listening to the ticket service
   * When a new ticket is created it is also saved in this service
   * @param data - Ticket data
   * @param payload - Message from NATS objetc
   */
  async onMessage(data: TicketCreatedEvent['data'], payload: Message) {
    const { id: ticketId, title = '', price, version } = data;

    const ticket = new Ticket({
      _id: ticketId,
      title,
      price,
      version,
    });
    await ticket.save();

    console.log(
      `Service: ${SERVICE_NAME} - TicketCreatedListener - Event received and business logic was processed, ${JSON.stringify(
        ticket
      )}`
    );
    payload.ack();
  }
}
