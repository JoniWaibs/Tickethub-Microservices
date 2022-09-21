import request from 'supertest';
import mongoose from 'mongoose';

import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { UserModel } from '../../types';
import { Global } from '../../types';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/tickets';

declare const global: Global;

describe('update tickets controller methods', () => {
  let cookie: string;
  let expected: any;
  let baseUrl: string;
  let authenticatedUserMock: UserModel;
  let ticketMock: any;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}`;
    authenticatedUserMock = {
      id: 'id-1234',
      email: 'test@test.com',
    };
    ticketMock = {
      title: 'test title',
      price: 2400,
      userId: 'id-1234',
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

  test('returns 400 error if invalid title or price is provided', async () => {
    const fakeTicketSchema = { title: '', price: 2400 };

    const expected = {
      errors: [{ message: 'Invalid or empty ticket title', field: 'title' }],
    };
    const response = await request(server)
      .put(`${baseUrl}/62b7c6adf9474e78ff36abb1`)
      .set('Cookie', cookie)
      .send(fakeTicketSchema);
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns 400 when ticket does not contain a valid id type', async () => {
    const response = await request(server).put(`${baseUrl}/not-valid-id`).set('Cookie', cookie).send(ticketMock);

    const expected = {
      errors: [{ message: 'Invalid or missing ticket id' }],
    };
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns 404 when ticket does not exists', async () => {
    const response = await request(server)
      .put(`${baseUrl}/62b7c6adf9474e78ff36abb1`)
      .set('Cookie', cookie)
      .send(ticketMock);

    const expected = {
      errors: [{ message: 'Ticket not found' }],
    };
    expect(response.status).toEqual(404);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns a 400 error when the user does not own the ticket', async () => {
    /**
     * Create a ticket with current user
     */
    const response = await request(server).post(baseUrl).set('Cookie', cookie).send(ticketMock);
    expect(response.status).toEqual(201);

    /**
     * Sign in with other credentials
     */
    authenticatedUserMock.id = 'id-123456789';
    const newCookie = global.signup(authenticatedUserMock);

    /**
     * Try tu update the same ticket with two different users
     */
    ticketMock.title = 'test new updated title';
    const newResponse = await request(server)
      .put(`${baseUrl}/${response.body.id}`)
      .set('Cookie', newCookie)
      .send(ticketMock);

    expected = {
      errors: [{ message: 'The ticket does not belong to user' }],
    };
    expect(newResponse.status).toEqual(400);
    expect(newResponse.text).toEqual(JSON.stringify(expected));
  });

  test('returns a 401 error when the tickets has been reserved', async () => {
    /**
     * Create a ticket with current user
     */
    const response = await request(server).post(baseUrl).set('Cookie', cookie).send(ticketMock);
    expect(response.status).toEqual(201);

    /**
     * Try tu update the same ticket but reserved
     */
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    const newResponse = await request(server)
      .put(`${baseUrl}/${response.body.id}`)
      .set('Cookie', cookie)
      .send(ticketMock);

    expected = {
      errors: [{ message: 'The ticket has been reserved' }],
    };
    expect(newResponse.status).toEqual(400);
    expect(newResponse.text).toEqual(JSON.stringify(expected));
  });

  test('update ticket with valid user and valid ticket schema', async () => {
    /**
     * Create a ticket
     */
    const response = await request(server).post(baseUrl).set('Cookie', cookie).send(ticketMock);
    expect(response.status).toEqual(201);

    /**
     * Try tu update title and price to the previously created ticket
     */
    ticketMock.title = 'test new updated title';
    ticketMock.price = 40000;
    await request(server).put(`${baseUrl}/${response.body.id}`).set('Cookie', cookie).send(ticketMock).expect(200);

    /**
     * Get updated ticket
     */
    const newResponse = await request(server).get(`${baseUrl}/${response.body.id}`).set('Cookie', cookie).send();

    expect(newResponse.status).toEqual(200);
    expect(newResponse.body.title).toEqual('test new updated title');
    expect(newResponse.body.price).toEqual(40000);
    expect(newResponse.body.userId).toEqual(ticketMock.userId);
  });

  test('publish an event after ticket is updated and saved', async () => {
    /**
     * Create a ticket
     */
    const response = await request(server).post(baseUrl).set('Cookie', cookie).send(ticketMock);
    expect(response.status).toEqual(201);

    /**
     * Try tu update title and price to the previously created ticket
     */
    ticketMock.title = 'test new updated title';
    ticketMock.price = 40000;
    await request(server).put(`${baseUrl}/${response.body.id}`).set('Cookie', cookie).send(ticketMock).expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
