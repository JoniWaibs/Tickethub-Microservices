import request from 'supertest';
import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { UserModel } from '../../types';

describe('signout controller methods', () => {
  let expected: any;
  let baseUrl: string;
  let userMock: UserModel;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}/signout`;
    userMock = {
      email: 'test@test.com',
      password: '1234567',
    };
  });

  test('returns a 200 on successful signin with valid user and sets cookie session as header and signin', async () => {
    /**
     * Signup and mock a valid user
     */
    await request(server).post(`${BASE_API_URL}/signup`).send(userMock).expect(201);

    /**
     * Signout
     */
    expected = {};
    const response = await request(server).post(baseUrl).send({}).expect(200);
    expect(response.get('Set-cookie')).toEqual(['session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly']);
    expect(response.body).toEqual(expected);
  });
});
