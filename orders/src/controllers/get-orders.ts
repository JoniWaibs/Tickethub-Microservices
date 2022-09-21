import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError, AuthorizationError } from '@ticket-hub/common';

import { Order } from '../models';

export const getOrdersController = {
  /**
   * Controller to get all orders
   * @param req - Express req fn
   * @param res - Express res fn
   */
  getOrders: async (req: Request, res: Response) => {
    const orders = await Order.find({ userId: req.currentUser!.id }).populate('ticket');

    res.status(200).json(orders);
  },

  /**
   * Controller to get a unique order by order-id
   * @param req - Express req fn
   * @param res - Express res fn
   */
  getOrdersById: async (req: Request, res: Response) => {
    const { id: orderId = '' } = req.params;

    /**
     * Input id validation
     */
    const mongooseIdType = new mongoose.Types.ObjectId(orderId).toString();
    const isValidId = mongooseIdType === orderId;
    if (!isValidId) {
      throw new BadRequestError('Invalid or missing order id');
    }

    const order = await Order.findById(orderId).populate('ticket');
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId !== req.currentUser!.id) {
      throw new AuthorizationError();
    }

    res.status(200).json(order);
  },
};
