import { Request, Response } from 'express';

/**
 * Controller to get current user
 * @param req - Express req fn
 * @param res - Express res fn
 */
export const currentUserController = (req: Request, res: Response) => {
  res.status(200).json({ currentUser: req.currentUser || null });
};
