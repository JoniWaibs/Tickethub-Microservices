import { body } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Create a req.body data validation schema for some endpoints
 * @returns - express-validator schema
 */
export const bodyValidatorSchema = () => {
  return [
    body('token').not().isEmpty().withMessage('Invalid or empty token'),
    body('orderId')
      .not()
      .isEmpty()
      .custom((orderId: string) => mongoose.Types.ObjectId.isValid(orderId))
      .withMessage('Invalid or empty orderId'),
  ];
};
