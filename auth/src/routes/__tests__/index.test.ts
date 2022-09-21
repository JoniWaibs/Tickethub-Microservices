import request from 'supertest';
import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { UserModel } from '../../types';

describe('App endpoints', () => {
  let expected: any;
  let baseUrl: string;
  let userMock: UserModel;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}`;
    userMock = {
      email: 'test@test.com',
      password: '1234567',
    };
  });

  test('returns 404 error when endpoint does not exists', async () => {
    const response = await request(server).post(`${baseUrl}/wrong-endpoint`).send({});
    expect(response.status).toEqual(404);
  });

  test('has a route handler listening on /api/auth/signout for post requests', async () => {
    const response = await request(server).post(`${baseUrl}/signout`).send(userMock);
    expect(response.status).toEqual(200);
  });

  test('healthyCheck endpoint does works', async () => {
    const response = await request(server).get(`${baseUrl}/healthcheck`).send({});
    expect(response.status).toEqual(200);

    expected = {
      Info: 'isHealthy',
    };
    expect(response.text).toEqual(JSON.stringify(expected));
  });
});
