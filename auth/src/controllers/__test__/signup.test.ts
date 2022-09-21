import request from 'supertest';

import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { UserModel } from '../../types';

describe('signup controller methods', () => {
  let expected: any;
  let baseUrl: string;
  let userMock: UserModel;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}/signup`;
    userMock = {
      email: 'test@test.com',
      password: '1234567',
    };
  });

  test('returns a 201 on successful signup', async () => {
    const response = await request(server).post(baseUrl).send(userMock);
    expect(response.status).toEqual(201);
    expect(response.body.email).toEqual(userMock.email);
    expect(response.body.id).toBeDefined();
  });

  test('sets headers with a cookie after signup', async () => {
    const response = await request(server).post(baseUrl).send(userMock);
    expect(response.status).toEqual(201);
    expect(response.get('Set-cookie')).toBeDefined();
  });

  test('returns a 400 with an invalid email', async () => {
    (userMock.email = ''),
      (expected = {
        errors: [
          {
            message: 'Email must be valid',
            field: 'email',
          },
        ],
      });

    const response = await request(server).post(baseUrl).send(userMock);
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns a 400 with an invalid password', async () => {
    (userMock.password = ''),
      (expected = {
        errors: [
          {
            message: 'Password must be at least 6 characters',
            field: 'password',
          },
        ],
      });

    const response = await request(server).post(baseUrl).send(userMock);
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns a 400 with missing email and password', async () => {
    userMock = {
      email: '',
      password: '',
    };

    expected = {
      errors: [
        {
          message: 'Email must be valid',
          field: 'email',
        },
        {
          message: 'Password must be at least 6 characters',
          field: 'password',
        },
      ],
    };

    const response = await request(server).post(baseUrl).send(userMock);
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('disallows duplicated emails', async () => {
    expected = {
      errors: [
        {
          message: 'User already exists',
        },
      ],
    };

    const response = await request(server).post(baseUrl).send(userMock);
    expect(response.status).toEqual(201);

    const rejectedResponse = await request(server).post(baseUrl).send(userMock);
    expect(rejectedResponse.status).toEqual(400);
    expect(rejectedResponse.text).toEqual(JSON.stringify(expected));
  });
});
