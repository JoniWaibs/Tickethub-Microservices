import request from 'supertest';

import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { UserModel } from '../../types';
import { Global } from '../../types';

declare const global: Global;

describe('get tickets controller methods', () => {
  let cookie: string;
  let baseUrl: string;
  let authenticatedUserMock: UserModel;
  let ticketsList: object[];

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}`;
    authenticatedUserMock = {
      id: 'id-1234',
      email: 'test@test.com',
    };
    ticketsList = [
      {
        title: 'test title',
        price: 2400,
        userId: 'id-1234',
      },
      {
        title: 'test title 2',
        price: 2500,
        userId: 'id-12345',
      },
    ];

    /**
     * Signup and mock a valid user and get cookie
     */
    cookie = global.signup(authenticatedUserMock);
  });

  test('retrieves all tickets', async () => {
    /**
     * Create a ticket list
     */
    ticketsList.forEach(async ticketMock => {
      const response = await request(server).post(baseUrl).set('Cookie', cookie).send(ticketMock);
      expect(response.status).toEqual(201);
    });

    /**
     * Api call to find ticket list
     */
    const ticketResponse = await request(server).get(baseUrl);
    expect(ticketResponse.status).toEqual(200);
    expect(Array.isArray(ticketResponse.body)).toBe(true);
    expect(ticketResponse.body.length).toEqual(2);
  });
});
