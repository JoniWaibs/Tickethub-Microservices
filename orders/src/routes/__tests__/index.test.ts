import request from 'supertest';
import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';

describe('App endpoints', () => {
  let expected: any;
  let baseUrl: string;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}`;
  });

  test('returns 404 error when endpoint does not exists', async () => {
    const response = await request(server).post(`${baseUrl}/wrong-endpoint`).send({});
    expect(response.status).toEqual(404);
  });

  test('healthyCheck endpoint does works', async () => {
    const response = await request(server).get(`${baseUrl}/healthcheck`).send({});

    expected = {
      Info: 'isHealthy',
    };
    expect(response.status).toEqual(200);
    expect(response.text).toEqual(JSON.stringify(expected));
  });
});
