import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '@ticket-hub/common';
import { User } from '../models/user';
import { Password } from '../utils/hash-password';

/**
 * Controller to signin the user
 * @param req - Express req fn
 * @param res - Express res fn
 */
export const signinController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  /**
   * Duplicated user validation
   */
  const userExists = await User.findOne({ email });
  if (!userExists) {
    throw new BadRequestError('User does not exists, you can create a free account');
  }

  /**
   * Compare hashed password
   */
  const hasMatchedPassword = await Password.compare(userExists.password, password);
  if (!hasMatchedPassword) {
    throw new BadRequestError('Invalid password');
  }

  /**
   * Generate JWT and store it on session object
   */
  const token = jwt.sign({ id: userExists.id, email: userExists.email }, process.env.JWT_SECRET_KEY!, {
    expiresIn: 864000,
  });
  req.session = { jwt: token };

  res.status(200).json(userExists);
};
