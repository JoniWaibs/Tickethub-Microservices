import { requestValidationMiddleware, requireAuthMiddleware } from '@ticket-hub/common';
import express from 'express';
import { createChargeController } from '../controllers/create-charge';

import { BASE_API_URL } from '../enums/api-url';
import { bodyValidatorSchema } from '../utils/validators';

const router = express.Router();

/**
 * Commons service endpoints
 */
router.post(
  `${BASE_API_URL}`,
  requireAuthMiddleware,
  bodyValidatorSchema(),
  requestValidationMiddleware,
  createChargeController
);

export const appRouter = router;
