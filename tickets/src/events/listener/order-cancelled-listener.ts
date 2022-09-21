import { Listener, NotFoundError, OrderCancelledEvent, Topics } from '@ticket-hub/common';
import { Message } from 'node-nats-streaming';

import { SERVICE_NAME } from '../../enums/constants';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publisher/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  topic: Topics.OrderCancelled = Topics.OrderCancelled;
  queueGroupName = SERVICE_NAME;

  /**
   * This event is listening to orders service
   * When order is cancelled the ticket will be updated and unblocked
   * @param data - Order data
   * @param payload - Message from NATS objetc
   */
  async onMessage(data: OrderCancelledEvent['data'], payload: Message) {
    const { ticket: orderTicket } = data;
    const { id: ticketId } = orderTicket;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    ticket.set({ orderId: undefined });
    const ticketUpdated = await ticket.save();

    /**Emin an event whit updated ticket (mark as undefined orderId) as a unblocked*/
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticketUpdated!.id,
      title: ticketUpdated!.title,
      price: ticketUpdated!.price,
      userId: ticketUpdated!.userId,
      version: ticketUpdated!.version,
      orderId: undefined,
    });

    console.log(
      `Service: ${SERVICE_NAME} - OrderCancelledListener - Event received and business logic was processed, ${JSON.stringify(
        ticketUpdated
      )}`
    );
    payload.ack();
  }
}
