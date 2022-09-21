import { Message } from 'node-nats-streaming';
import { Listener, NotFoundError, TicketUpdatedEvent, Topics } from '@ticket-hub/common';
import { SERVICE_NAME } from '../../enums/constants';
import { Ticket } from '../../models';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  topic: Topics.TicketUpdated = Topics.TicketUpdated;
  queueGroupName = SERVICE_NAME;

  /**
   * This event updates an associated ticket to a order
   * When a n ticket is updates it is also updated in this service
   * @param data - Ticket data
   * @param payload - Message from NATS objetc
   */
  async onMessage(data: TicketUpdatedEvent['data'], payload: Message) {
    const { id: ticketId, title = '', price, version } = data;

    const ticket = await Ticket.findOne({
      _id: ticketId,
      version: version - 1,
    });

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    ticket.set({ title, price });
    const ticketUpdated = await ticket.save();

    console.log(
      `Service: ${SERVICE_NAME} - TicketUpdatedListener - Event received and business logic was processed, ${JSON.stringify(
        ticketUpdated
      )}`
    );
    payload.ack();
  }
}
