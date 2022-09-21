import { Request, Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus } from '@ticket-hub/common';

import { Order } from '../models/orders';
import { Ticket } from '../models/tickets';
import { expirationTime } from '../enums/expiration-time';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

/**
 * Controller to create a new order
 * @param req - Express req fn
 * @param res - Express res fn
 */
export const createOrdersController = async (req: Request, res: Response) => {
  const { id: ticketId = '' } = req.body;

  /**
   * Find the ticket the user is trying to order in DDBB
   */
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  /**
   * Make suer that this ticket is not already reserved
   * Run query to look at all orders, Find an order where the ticket
   * is the ticket we just found and order status is NOT cancelled.
   * If we find and order from that means the ticket is reserved
   */
  const isReserved = await ticket.isReserved();
  if (isReserved) {
    throw new BadRequestError('Ticket is already reserved');
  }

  /**
   * Calculate expiration date for this order
   * as default expiration time must be 15 minutes
   */
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + expirationTime.DEFAULT);

  /**
   * Build order
   */
  const order = new Order({
    userId: req.currentUser!.id,
    status: OrderStatus.CREATED,
    expiresAt: expiration,
    ticket,
  });
  await order.save();

  /**
   * Send event to topic: order:created
   */
  const publisher = new OrderCreatedPublisher(natsWrapper.client);
  const eventData = {
    version: order.version,
    id: order.id,
    status: order.status,
    userId: order.userId,
    expiresAt: order.expiresAt.toISOString(),
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

  res.status(201).json(order);
};
