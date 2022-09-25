import request from 'supertest';
import { server } from '../../app';
import { BASE_API_URL } from '../../enums/api-url';
import { UserModel } from '../../types';
import { Global } from '../../types';

declare const global: Global;

describe('current-user controller methods', () => {
  let expected: any;
  let baseUrl: string;
  let userMock: UserModel;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}/currentuser`;
    userMock = {
      email: 'test@test.com',
      password: '1234567',
    };
  });

  test('returns data from current-user', async () => {
    /**
     * Signup and mock a valid user and get cookie
     */
    const cookie = await global.signup(userMock);

    /**
     * Get current-user data
     */
    expected = {
      email: 'test@test.com',
    };
    const response = await request(server).get(baseUrl).set('Cookie', cookie).send();
    expect(response.status).toEqual(200);
    expect(response.body.currentUser.email).toEqual(expected.email);
  });

  test('returns null when cookie if user is not authenticated', async () => {
    /**
     * Get current-user data
     */
    expected = {
      email: 'test@test.com',
    };
    const response = await request(server).get(baseUrl);
    expect(response.status).toEqual(200);
    expect(response.body.currentUser).toBeNull();
  });
});
