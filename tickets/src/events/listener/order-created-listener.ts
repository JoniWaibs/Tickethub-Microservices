import { Listener, NotFoundError, OrderCreatedEvent, Topics } from '@ticket-hub/common';
import { Message } from 'node-nats-streaming';

import { SERVICE_NAME } from '../../enums/constants';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publisher/ticket-updated-publisher';

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
    const { ticket: orderTicket, id: orderId } = data;
    const { id: ticketId } = orderTicket;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    ticket.set({ orderId });
    const ticketUpdated = await ticket.save();

    /**Emin an event whit updated ticket (with orderId) */
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticketUpdated!.id,
      title: ticketUpdated!.title,
      price: ticketUpdated!.price,
      userId: ticketUpdated!.userId,
      version: ticketUpdated!.version,
      orderId: ticketUpdated!.orderId,
    });

    console.log(
      `Service: ${SERVICE_NAME} - OrderCreatedListener - Event received and business logic was processed, ${JSON.stringify(
        ticketUpdated
      )}`
    );
    payload.ack();
  }
}
