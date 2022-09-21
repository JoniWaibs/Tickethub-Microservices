import { Request, Response } from 'express';

/**
 * Controller signout user
 * @param req - Express req fn
 * @param res - Express res fn
 */
export const signoutController = (req: Request, res: Response) => {
  /**
   * Destroy cookie
   */
  req.session = null;
  res.json({});
};
