import { body } from 'express-validator';

/**
 * Create a req.body data validation schema for some endpoints
 * @returns - express-validator schema
 */
export const bodyValidatorSchema = () => {
  return [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ];
};
