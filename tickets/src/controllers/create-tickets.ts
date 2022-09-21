import { Request, Response } from "express";

import { TicketCreatedPublisher } from "../events/publisher/ticket-created-publisher";
import { Ticket } from "../models/tickets";
import { natsWrapper } from "../nats-wrapper";

/**
 * Controller to create a new ticket
 * @param req - Express req fn
 * @param res - Express res fn
 */
export const createTicketsController = async (req: Request, res: Response) => {
  const { title, price } = req.body;

  /**
   * Create and save new user
   */
  const ticket = new Ticket({ title, price, userId: req.currentUser!.id });
  await ticket.save();

  /**
   * Send event to topic: ticket:created
   */
  const publisher = new TicketCreatedPublisher(natsWrapper.client);
  const eventData = {
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version,
  };
  try {
    await publisher.publish(eventData);
  } catch (error) {
    console.log(error);
  }

  res.status(201).json(ticket);
};
