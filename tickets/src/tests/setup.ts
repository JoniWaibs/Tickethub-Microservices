import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { UserModel, Global } from '../types';

declare const global: Global;
let mongo: any;
jest.mock('../nats-wrapper.ts');

/**
 * Connect mongoose with MongoMemoryServer for testing purposes
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
  jest.clearAllMocks();
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
 * Create cookie session with previously mocked authenticated user
 * @param authenticatedUserMock - User previously authenticated object
 * @returns cookie
 */
global.signup = (authenticatedUserMock: UserModel): string => {
  /**
   * Create JWT after user did signed in
   */
  const token = jwt.sign(authenticatedUserMock, process.env.JWT_SECRET_KEY!);

  /**
   * Build session with that JTW
   */
  const session = { jwt: token };

  /**
   * Parse session object to JSON
   */
  const sessionJSON = JSON.stringify(session);

  /**
   * Encode JSON to base64
   */
  const base64 = Buffer.from(sessionJSON).toString('base64');

  /**
   * Build a valid authentication cookie
   */
  const cookie = `session=${base64}`;

  return cookie;
};
