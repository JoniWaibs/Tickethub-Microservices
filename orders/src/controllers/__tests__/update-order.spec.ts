import request from 'supertest';
import mongoose from 'mongoose';
import { OrderStatus } from '@ticket-hub/common';

import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { UserModel } from '../../types';
import { Global } from '../../types';
import { Ticket } from '../../models';
import { natsWrapper } from '../../nats-wrapper';

declare const global: Global;

describe('update orders controller', () => {
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
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'test title 1',
      price: 2400,
    };
    /**
     * Signup and mock a valid user and get cookie
     */
    cookie = global.signup(authenticatedUserMock);
  });

  test('returns a 401 error when the user is not signed in', async () => {
    const response = await request(server).post(baseUrl).set({});

    expected = {
      errors: [{ message: 'Unauthorized' }],
    };
    expect(response.status).toEqual(401);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns 400 when ticket does not contain a valid id type', async () => {
    const response = await request(server).patch(`${baseUrl}/not-valid-id`).set('Cookie', cookie);

    /**
     * Api call to find order
     */
    expected = {
      errors: [{ message: 'Invalid or missing order id' }],
    };
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns 404 when order does not exists', async () => {
    const response = await request(server).patch(`${baseUrl}/6e6f742d76616c69642d6964`).set('Cookie', cookie);

    /**
     * Api call to find order
     */
    expected = {
      errors: [{ message: 'Order not found' }],
    };
    expect(response.status).toEqual(404);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns 401 when user is not own the order', async () => {
    /**
     * Create fake ticket and then create order
     */
    const ticket = new Ticket(ticketMock);
    await ticket.save();
    const { body: order } = await request(server)
      .post(baseUrl)
      .set('Cookie', cookie)
      .send({ id: ticket.id })
      .expect(201);

    /**
     * Api call to find order
     */
    const authenticatedUserMockTwo = {
      id: 'id-12345-abc',
      email: 'mock@mock.com',
    };
    const newUserCookie = global.signup(authenticatedUserMockTwo);
    const response = await request(server).patch(`${baseUrl}/${order.id}`).set('Cookie', newUserCookie);

    expected = {
      errors: [{ message: 'Unauthorized' }],
    };
    expect(response.status).toEqual(401);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('create an order and update(cancel) this', async () => {
    /**
     * Create fake ticket and then create order
     */
    const ticket = new Ticket(ticketMock);
    await ticket.save();
    const { body: order } = await request(server)
      .post(baseUrl)
      .set('Cookie', cookie)
      .send({ id: ticket.id })
      .expect(201);

    /**
     * Api call to update(cancel) order
     */
    await request(server).patch(`${baseUrl}/${order.id}`).set('Cookie', cookie).expect(204);

    /**
     * Api call to validate order was updated(cancelled) successfully
     */
    const response = await request(server).get(`${baseUrl}/${order.id}`).set('Cookie', cookie);
    expect(response.body.id).toEqual(order.id);
    expect(response.body.ticket.id).toEqual(ticket.id);
    expect(response.body.status).toEqual(OrderStatus.CANCELLED);
  });

  test('emits an order updated event', async () => {
    /**
     * Create fake ticket and then create order
     */
    const ticket = new Ticket(ticketMock);
    await ticket.save();
    const { body: order } = await request(server)
      .post(baseUrl)
      .set('Cookie', cookie)
      .send({ id: ticket.id })
      .expect(201);

    /**
     * Api call to update(cancel) order
     */
    await request(server).patch(`${baseUrl}/${order.id}`).set('Cookie', cookie).expect(204);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
