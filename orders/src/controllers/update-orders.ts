import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthorizationError, BadRequestError, NotFoundError, OrderStatus } from '@ticket-hub/common';

import { OrderCancelledPublisher } from '../events/publisher/order-cancelled-publisher';
import { Order } from '../models';
import { natsWrapper } from '../nats-wrapper';

/**
 * Controller to update orders
 * @param req - Express req fn
 * @param res - Express res fn
 */
export const updateOrdersController = async (req: Request, res: Response) => {
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

  /**
   * Cancel order, thats === to update
   */
  order.status = OrderStatus.CANCELLED;
  order.save();

  /**
   * Send event to topic: order:cancelled
   */
  const publisher = new OrderCancelledPublisher(natsWrapper.client);
  const eventData = {
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
      price: order.ticket.price,
    },
  };

  try {
    await publisher.publish(eventData);
  } catch (error) {
    console.log(error);
  }

  res.status(204).json({});
};
