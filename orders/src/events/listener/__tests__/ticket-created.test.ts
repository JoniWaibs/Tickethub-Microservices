import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@ticket-hub/common';

import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import { Ticket } from '../../../models';

describe('ticket-created listener', () => {
  let listener: any;
  let ticketCreatedData: TicketCreatedEvent['data'];
  let payload: Message;

  beforeEach(() => {
    listener = new TicketCreatedListener(natsWrapper.client);

    ticketCreatedData = {
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'ticket-title',
      price: 100,
    };

    //@ts-ignore
    payload = {
      ack: jest.fn(),
    };
  });

  test('creates and saves a ticket', async () => {
    /**On message event must save a ticket */
    await listener.onMessage(ticketCreatedData, payload);

    /**Try to get a saved ticket */
    const ticket = await Ticket.findOne({ _id: ticketCreatedData.id });

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(ticketCreatedData.title);
    expect(ticket!.price).toEqual(ticketCreatedData.price);
  });

  test('send ack message', async () => {
    await listener.onMessage(ticketCreatedData, payload);

    expect(payload.ack).toHaveBeenCalled();
  });
});
