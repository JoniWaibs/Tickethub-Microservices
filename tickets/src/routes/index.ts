import express from "express";
import {
  requestValidationMiddleware,
  requireAuthMiddleware,
} from "@ticket-hub/common";

import { createTicketsController } from "../controllers/create-tickets";
import { getTicketsController } from "../controllers/get-tickets";
import { updateTicketsController } from "../controllers/update-tickets";
import { bodyValidatorSchema } from "../utils/validators";
import { BASE_API_URL } from "../enums/api-url";

const router = express.Router();

/**
 * Commons service endpoints
 */
router.get(`${BASE_API_URL}`, getTicketsController.getAllTickets);
router.get(`${BASE_API_URL}/:id`, getTicketsController.getTicketById);
router.post(
  `${BASE_API_URL}`,
  requireAuthMiddleware,
  bodyValidatorSchema(),
  requestValidationMiddleware,
  createTicketsController
);
router.put(
  `${BASE_API_URL}/:id`,
  requireAuthMiddleware,
  bodyValidatorSchema(),
  requestValidationMiddleware,
  updateTicketsController
);

export const appRouter = router;
