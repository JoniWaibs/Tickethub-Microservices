import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '@ticket-hub/common';

import { User } from '../models/user';
import { UserModel } from '../types';

/**
 * Controller to register a user
 * @param req - Express req fn
 * @param res - Express res fn
 */
export const signupController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  /**
   * Duplicated user validation
   */
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError('User already exists');
  }

  try {
    /**
     * Create and save new user
     */
    const user = new User<UserModel>({ email, password });
    await user.save();

    /**
     * Generate JWT and store it on session object
     */
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY!, { expiresIn: 864000 });
    req.session = { jwt: token };

    res.status(201).json(user);
  } catch (error) {
    throw new Error('An error has occurred, please try again');
  }
};
