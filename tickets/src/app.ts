import express, { Request, Response } from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';

import { appRouter } from './routes';
import { BASE_API_URL } from './enums/api-url';
import { currentUserMiddleware, errorRequestHandler, NotFoundError } from '@ticket-hub/common';

const app = express();

app.use(express.json());

/**
 * Cookie session configs
 */
app.set('trust proxy', true);
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

/**
 * Healthcheck service endpoint
 */
app.get(`${BASE_API_URL}/healthcheck`, (_req: Request, res: Response) => res.json({ Info: 'isHealthy' }));

/**
 * Retrieve current user from middleware
 */
app.use(currentUserMiddleware);

/**
 * Service router
 */
app.use(appRouter);

/**
 * NotFound Error when any endpoint does not exist
 */
app.all('*', async (_req: Request, _res: Response) => {
  throw new NotFoundError('Endpoint not found');
});

/**
 * Error middleware
 */
app.use(errorRequestHandler);

/**
 * Expose server app
 */
export const server = app;
