import request from 'supertest';

import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { UserModel } from '../../types';

describe('signin controller methods', () => {
  let expected: any;
  let baseUrl: string;
  let userMock: UserModel;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}/signin`;
    userMock = {
      email: 'test@test.com',
      password: '1234567',
    };
  });

  test('returns a 200 on successful signin with valid user and sets cookie session as header', async () => {
    /**
     * Signup and mock a valid user
     */
    await request(server).post(`${BASE_API_URL}/signup`).send(userMock).expect(201);

    const response = await request(server).post(baseUrl).send(userMock);
    expect(response.status).toEqual(200);
    expect(response.body.email).toEqual(userMock.email);
    expect(response.body.id).toBeDefined();

    expect(response.get('Set-cookie')).toBeDefined();
  });

  test('returns error when user does not exists on DDBB', async () => {
    expected = {
      errors: [
        {
          message: 'User does not exists, you can create a free account',
        },
      ],
    };

    const response = await request(server).post(baseUrl).send(userMock);
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns a 400 with an invalid email', async () => {
    /**
     * Signup and mock a valid user
     */
    await request(server).post(`${BASE_API_URL}/signup`).send(userMock).expect(201);

    /**
     * Try to signin whit invalid email
     */
    userMock.email = '';

    expected = {
      errors: [
        {
          message: 'Email must be valid',
          field: 'email',
        },
      ],
    };

    const response = await request(server).post(baseUrl).send(userMock);
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns a 400 with an empty password', async () => {
    /**
     * Signup and mock a valid user
     */
    await request(server).post(`${BASE_API_URL}/signup`).send(userMock).expect(201);

    /**
     * Try to signin whit invalid password
     */
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

  test('returns a 400 with an invalid password', async () => {
    /**
     * Signup and mock a valid user
     */
    await request(server).post(`${BASE_API_URL}/signup`).send(userMock).expect(201);

    /**
     * Try to signin whit invalid password
     */
    (userMock.password = 'invalid-password-test'),
      (expected = {
        errors: [
          {
            message: 'Invalid password',
          },
        ],
      });

    const response = await request(server).post(baseUrl).send(userMock);
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test('returns a 400 with missing email and password', async () => {
    /**
     * Signup and mock a valid user
     */
    await request(server).post(`${BASE_API_URL}/signup`).send(userMock).expect(201);

    /**
     * Try to signin whit invalid email and password
     */
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
});
