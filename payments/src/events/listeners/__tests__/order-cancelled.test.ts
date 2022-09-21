import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@ticket-hub/common';

import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models';

describe('order-cancelled listener', () => {
  let listener: any;
  let orderData: OrderCancelledEvent['data'];
  let payload: Message;
  let order: any;

  beforeEach(async () => {
    listener = new OrderCancelledListener(natsWrapper.client);

    order = new Order({
      id: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.CREATED,
      price: 10,
      userId: 'asldkfj',
      version: 0,
    });
    await order.save();

    orderData = {
      id: order.id,
      version: 1,
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

  test('updates the status of the order', async () => {
    await listener.onMessage(orderData, payload);

    const updatedOrder = await Order.findById(orderData.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
  });

  test('send ack message', async () => {
    await listener.onMessage(orderData, payload);

    expect(payload.ack).toHaveBeenCalled();
  });
});
