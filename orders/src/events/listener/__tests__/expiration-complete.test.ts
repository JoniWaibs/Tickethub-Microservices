import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent, OrderStatus } from '@ticket-hub/common';

import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Order, Ticket } from '../../../models';

describe('expiration-complete listener', () => {
  let listener: any;
  let orderData: ExpirationCompleteEvent['data'];
  let payload: Message;

  beforeEach(async () => {
    listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = new Ticket({
      version: 0,
      _id: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      title: 'ticket-title',
      price: 100,
    });
    await ticket.save();

    const order = new Order({
      status: OrderStatus.CREATED,
      userId: 'order-id-test',
      expiresAt: new Date(),
      ticket,
    });
    await order.save();

    orderData = {
      orderId: order.id,
    };

    //@ts-ignore
    payload = {
      ack: jest.fn(),
    };
  });

  test('updates the order status to cancelled', async () => {
    /**On message event must find a order */
    await listener.onMessage(orderData, payload);

    /**Try to get a updated order */
    const orderUpdated = await Order.findById(orderData.orderId);

    expect(orderUpdated).toBeDefined();
    expect(orderUpdated!.status).toEqual(OrderStatus.CANCELLED);
  });

  test('send ack message', async () => {
    await listener.onMessage(orderData, payload);

    expect(payload.ack).toHaveBeenCalled();
  });

  test('publish a order updated event', async () => {
    await listener.onMessage(orderData, payload);

    /** Must call OrderUpdatedPublisher*/
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    /** Validate data with that publisher is calling */
    const orderUpdated = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(orderUpdated).toBeDefined();
    expect(orderUpdated!.id).toEqual(orderData.orderId);
  });

  test('does not send ack message', async () => {
    /** must not find order because id does not exist */
    orderData.orderId = '6325f5cff3a3d6ef8f619f00';

    try {
      await listener.onMessage(orderData, payload);
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error).toEqual(Error('Order not found'));
    }

    expect(payload.ack).not.toHaveBeenCalled();
  });
});
