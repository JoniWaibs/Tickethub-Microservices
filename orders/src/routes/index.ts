import express from 'express';
import { requestValidationMiddleware, requireAuthMiddleware } from '@ticket-hub/common';

import { BASE_API_URL } from '../enums/api-url';
import { getOrdersController } from '../controllers/get-orders';
import { createOrdersController } from '../controllers/create-orders';
import { updateOrdersController } from '../controllers/update-orders';
import { bodyValidatorSchema } from '../utils/validators';

const router = express.Router();

/**
 * Commons service endpoints
 */
router.get(`${BASE_API_URL}`, requireAuthMiddleware, getOrdersController.getOrders);
router.get(`${BASE_API_URL}/:id`, requireAuthMiddleware, getOrdersController.getOrdersById);
router.post(
  `${BASE_API_URL}`,
  requireAuthMiddleware,
  bodyValidatorSchema(),
  requestValidationMiddleware,
  createOrdersController
);
router.patch(`${BASE_API_URL}/:id`, requireAuthMiddleware, updateOrdersController);

export const appRouter = router;
