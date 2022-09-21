import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { TicketUpdatedEvent } from '@ticket-hub/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Ticket } from '../../../models';

describe('ticket-updated listener', () => {
  let listener: any;
  let ticketData: TicketUpdatedEvent['data'];
  let payload: Message;

  beforeEach(async () => {
    listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = new Ticket({
      version: 0,
      _id: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      title: 'ticket-title',
      price: 100,
    });
    await ticket.save();

    ticketData = {
      id: ticket.id,
      version: ticket.version + 1,
      userId: 'userId',
      title: 'ticket title updated',
      price: 999,
    };

    //@ts-ignore
    payload = {
      ack: jest.fn(),
    };
  });

  test('find, updates and saves a ticket', async () => {
    /**On message event must find a ticket */
    await listener.onMessage(ticketData, payload);

    /**Try to get a updated ticket */
    const ticketUpdated = await Ticket.findById(ticketData.id);

    expect(ticketUpdated).toBeDefined();
    expect(ticketUpdated!.title).toEqual(ticketData.title);
    expect(ticketUpdated!.price).toEqual(ticketData.price);
  });

  test('send ack message', async () => {
    await listener.onMessage(ticketData, payload);

    expect(payload.ack).toHaveBeenCalled();
  });

  test('does not send ack message', async () => {
    /** must not find ticket because version does not exist  */
    ticketData.version = 10;

    try {
      await listener.onMessage(ticketData, payload);
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error).toEqual(Error('Ticket not found'));
    }

    expect(payload.ack).not.toHaveBeenCalled();
  });
});
