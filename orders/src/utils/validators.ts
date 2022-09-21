import { body } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Create a req.body data validation schema for some endpoints
 * @returns - express-validator schema
 */
export const bodyValidatorSchema = () => {
  return [
    body('id')
      .not()
      .isEmpty()
      .custom((ticketId: string) => mongoose.Types.ObjectId.isValid(ticketId))
      .withMessage('Invalid or empty ticketId'),
  ];
};
