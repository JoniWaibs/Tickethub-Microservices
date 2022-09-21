import { BadRequestError, NotFoundError, OrderStatus } from '@ticket-hub/common';
import { Request, Response } from 'express';
import { DEFAULT_CURRENCY } from '../enums/constants';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';

import { Order, Payment } from '../models';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';

/**
 * Controller to create a new charge
 *
 * (CHARGE === PAYMENT) in Stripe world
 *
 * @param req - Express req fn
 * @param res - Express res fn
 */
export const createChargeController = async (req: Request, res: Response) => {
  const { orderId, token } = req.body;
  /**
   * Find the order saved
   */
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  /**
   * Validate if user is order owner
   */
  const isOwner = order.userId === req.currentUser!.id;
  if (!isOwner) {
    throw new BadRequestError('The order does not belong to user');
  }

  /**
   * Validat if order does not cancelled
   */
  const isCancelled = order.status === OrderStatus.CANCELLED;
  if (isCancelled) {
    throw new BadRequestError('Cannot pay for an cancelled order');
  }

  /**
   * Create a new charge/payment
   * Currency: Three-letter ISO currency code, in lowercase
   * amount: A positive integer representing how much to charge in the smallest currency unit
   * source: This can be the ID of a card (i.e., credit or debit card), a bank account, a source, a token, or a connected account.
   * DOCS: https://stripe.com/docs/api/charges/create#create_charge-amount
   */
  const charge = await stripe.charges.create({
    currency: DEFAULT_CURRENCY,
    amount: order.price * 100,
    source: token,
  });

  const payment = new Payment({
    orderId,
    stripeId: charge.id,
  });
  await payment.save();

  /**
   * Send event to topic: payment:created
   */
  const publisher = new PaymentCreatedPublisher(natsWrapper.client);
  const eventData = {
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stripeId,
  };

  try {
    await publisher.publish(eventData);
  } catch (error) {
    console.log(error);
  }

  res.status(201).json({ id: payment.id });
};
