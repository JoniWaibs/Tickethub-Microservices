import { OrderStatus } from '@ticket-hub/common';
import mongoose from 'mongoose';
import request from 'supertest';

import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { Order } from '../../models';
import { Global } from '../../types';
import { stripe } from '../../stripe';
import { UserModel } from '../../types';

declare const global: Global;

describe('create new charge controller', () => {
  let cookie: string;
  let baseUrl: string;
  let authenticatedUserMock: UserModel;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}`;
    authenticatedUserMock = {
      id: 'id-1234',
      email: 'test@test.com',
    };

    /**
     * Signup and mock a valid user and get cookie
     */
    cookie = global.signup(authenticatedUserMock);
  });

  test('returns a 404 when purchasing an order that does not exist', async () => {
    const bodyParams = {
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: 'sarasa',
    };

    const response = await request(server).post(baseUrl).set('Cookie', cookie).send(bodyParams);

    const expected = {
      errors: [{ message: 'Order not found' }],
    };

    expect(response.status).toEqual(404);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns a 400 when purchasing an order that doesnt belong to the user', async () => {
    const order = new Order({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      price: 20,
      status: OrderStatus.CREATED,
    });
    await order.save();

    const bodyParams = {
      orderId: order.id,
      token: 'sarasa',
    };

    const response = await request(server).post(baseUrl).set('Cookie', cookie).send(bodyParams);

    const expected = {
      errors: [{ message: 'The order does not belong to user' }],
    };

    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns a 400 when purchasing a cancelled order', async () => {
    const order = new Order({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: authenticatedUserMock.id,
      version: 0,
      price: 20,
      status: OrderStatus.CANCELLED,
    });
    await order.save();

    const bodyParams = {
      orderId: order.id,
      token: 'sarasa',
    };

    const response = await request(server).post(baseUrl).set('Cookie', cookie).send(bodyParams);

    const expected = {
      errors: [{ message: 'Cannot pay for an cancelled order' }],
    };

    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test.skip('returns a 201 with valid inputs', async () => {
    const order = new Order({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: authenticatedUserMock.id,
      version: 0,
      price: 20,
      status: OrderStatus.CREATED,
    });
    await order.save();

    const bodyParams = {
      orderId: order.id,
      token: 'tok_visa',
    };

    const response = await request(server).post(baseUrl).set('Cookie', cookie).send(bodyParams);
    console.log(response.text);
    expect(response.status).toEqual(201);
  });
});
