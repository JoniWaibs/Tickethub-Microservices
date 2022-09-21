import { body } from 'express-validator';

/**
 * Create a req.body data validation schema for some endpoints
 * @returns - express-validator schema
 */
export const bodyValidatorSchema = () => {
  return [
    body('title').isString().notEmpty().withMessage('Invalid or empty ticket title'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  ];
};
