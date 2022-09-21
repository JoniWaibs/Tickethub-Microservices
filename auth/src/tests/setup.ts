import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { server } from '../app';
import { BASE_API_URL } from '../enums/api-url';
import { UserModel, Global } from '../types';

declare const global: Global;
let mongo: any;

/**
 * Connect mongoose with mongo
 */
beforeAll(async () => {
  /**
   * Sets environment variable for testing purposes
   */
  process.env.JWT_SECRET_KEY = 'testing-secret-key';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

/**
 * Delete all collections
 */
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  collections.forEach(collection => collection.deleteMany({}));
});

/**
 * Stop and close DDBB connection
 */
afterAll(done => {
  mongo.stop();
  mongoose.connection.close();
  done();
});

/**
 * Signup and returns cookie
 * @param userMock - User obvject
 * @returns cookie
 */
global.signup = async (userMock: UserModel): Promise<string> => {
  const authResponse = await request(server).post(`${BASE_API_URL}/signup`).send(userMock).expect(201);
  const cookie = authResponse.get('Set-cookie');
  return cookie;
};
