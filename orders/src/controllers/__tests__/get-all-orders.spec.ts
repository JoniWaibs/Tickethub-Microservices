import request from 'supertest';
import mongoose from 'mongoose';

import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { UserModel } from '../../types';
import { Global } from '../../types';
import { Ticket } from '../../models';

declare const global: Global;

describe('get orders controller, get all orders', () => {
  let cookie: string;
  let expected: any;
  let baseUrl: string;
  let authenticatedUserMock: UserModel;
  let ticketMock: Array<object>;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}`;
    authenticatedUserMock = {
      id: 'id-1234',
      email: 'test@test.com',
    };
    (ticketMock = [
      {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'test title 1',
        price: 2400,
      },
      {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'test title 2',
        price: 2500,
      },
    ]),
      /**
       * Signup and mock a valid user and get cookie
       */
      (cookie = global.signup(authenticatedUserMock));
  });

  test('returns a 401 error when the user is not signed in', async () => {
    const response = await request(server).post(baseUrl).send({});

    expected = {
      errors: [{ message: 'Unauthorized' }],
    };
    expect(response.status).toEqual(401);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('create some orders and fetch those for an particular user', async () => {
    /**
     * Create fake tickets and then create orders
     */
    const ticketOne = new Ticket(ticketMock[0]);
    await ticketOne.save();
    const { body: orderOne } = await request(server)
      .post(baseUrl)
      .set('Cookie', cookie)
      .send({ id: ticketOne.id })
      .expect(201);

    const ticketTwo = new Ticket(ticketMock[1]);
    await ticketTwo.save();
    const { body: orderTwo } = await request(server)
      .post(baseUrl)
      .set('Cookie', cookie)
      .send({ id: ticketTwo.id })
      .expect(201);

    /**
     * Api call to find orders list
     */
    const ordersResponse = await request(server).get(baseUrl).set('Cookie', cookie);
    expect(ordersResponse.status).toEqual(200);
    expect(Array.isArray(ordersResponse.body)).toBe(true);
    expect(ordersResponse.body.length).toEqual(2);

    /**
     * Validate orderId and ticketId from each order
     */
    expect(ordersResponse.body[0].id).toEqual(orderOne.id);
    expect(ordersResponse.body[0].ticket.id).toEqual(ticketOne.id);

    expect(ordersResponse.body[1].id).toEqual(orderTwo.id);
    expect(ordersResponse.body[1].ticket.id).toEqual(ticketTwo.id);
  });
});
