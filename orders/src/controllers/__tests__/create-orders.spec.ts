import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@ticket-hub/common';

import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { UserModel } from '../../types';
import { Global } from '../../types';
import { Ticket, Order } from '../../models';
import { natsWrapper } from '../../nats-wrapper';

declare const global: Global;

describe('create orders controller', () => {
  let cookie: string;
  let expected: any;
  let baseUrl: string;
  let authenticatedUserMock: UserModel;
  let ticketMock: object;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}`;
    authenticatedUserMock = {
      id: 'id-1234',
      email: 'test@test.com',
    };
    ticketMock = {
      title: 'test title',
      price: 2400,
    };
    /**
     * Signup and mock a valid user and get cookie
     */
    cookie = global.signup(authenticatedUserMock);
  });

  test('returns a 401 error when the user is not signed in', async () => {
    const response = await request(server).post(baseUrl).send({});

    expected = {
      errors: [{ message: 'Unauthorized' }],
    };
    expect(response.status).toEqual(401);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns an error if the ticket does not exists', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    const expected = {
      errors: [{ message: 'Ticket not found' }],
    };
    const response = await request(server).post(baseUrl).set('Cookie', cookie).send({ id: ticketId });
    expect(response.status).toEqual(404);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns an error is the ticket already reserved', async () => {
    /**
     * Create fake ticket and then create an order
     */
    const ticket = new Ticket(ticketMock);
    await ticket.save();
    const order = new Order({
      ticket,
      status: OrderStatus.CREATED,
      expiresAt: new Date(),
      userId: authenticatedUserMock.id,
    });
    await order.save();

    const expected = {
      errors: [{ message: 'Ticket is already reserved' }],
    };
    const response = await request(server).post(baseUrl).set('Cookie', cookie).send({ id: ticket.id });
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('reserves a ticket', async () => {
    /**
     * Create fake ticket and then create an order
     */
    const ticket = new Ticket(ticketMock);
    await ticket.save();

    const response = await request(server).post(baseUrl).set('Cookie', cookie).send({ id: ticket.id });
    expect(response.status).toEqual(201);
  });

  test('emits an order created event', async () => {
    /**
     * Create fake ticket and then create an order
     */
    const ticket = new Ticket(ticketMock);
    await ticket.save();

    const response = await request(server).post(baseUrl).set('Cookie', cookie).send({ id: ticket.id });
    expect(response.status).toEqual(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
