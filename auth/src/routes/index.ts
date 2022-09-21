import express from 'express';
import { currentUserController } from '../controllers/current-user';
import { signinController } from '../controllers/signin';
import { signoutController } from '../controllers/signout';
import { signupController } from '../controllers/signup';

import { BASE_API_URL } from '../enums/api-url';
import { currentUserMiddleware, requestValidationMiddleware } from '@ticket-hub/common';
import { bodyValidatorSchema } from '../utils/validators';

const router = express.Router();

/**
 * Commons service endpoints
 */
router.post(`${BASE_API_URL}/signin`, bodyValidatorSchema(), requestValidationMiddleware, signinController);
router.post(`${BASE_API_URL}/signup`, bodyValidatorSchema(), requestValidationMiddleware, signupController);
router.post(`${BASE_API_URL}/signout`, signoutController);
router.get(`${BASE_API_URL}/currentuser`, currentUserMiddleware, currentUserController);

export const appRouter = router;
