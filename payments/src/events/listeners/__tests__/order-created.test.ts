import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@ticket-hub/common';

import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models/order';

describe('order-created listener', () => {
  let listener: any;
  let orderData: OrderCreatedEvent['data'];
  let payload: Message;

  beforeEach(async () => {
    listener = new OrderCreatedListener(natsWrapper.client);

    orderData = {
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: 'user-test',
      expiresAt: 'expires-date',
      status: OrderStatus.CREATED,
      version: 0,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
      },
    };

    //@ts-ignore
    payload = {
      ack: jest.fn(),
    };
  });

  test('create order info', async () => {
    /**On message event must find a ticket */
    await listener.onMessage(orderData, payload);

    /**Try to get a order */
    const orderCreated = await Order.findById(orderData.id);

    expect(orderCreated).toBeDefined();
    expect(orderCreated!.price).toEqual(orderData.ticket.price);
  });

  test('send ack message', async () => {
    await listener.onMessage(orderData, payload);

    expect(payload.ack).toHaveBeenCalled();
  });
});
