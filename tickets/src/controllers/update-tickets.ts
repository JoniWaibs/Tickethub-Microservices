import { Request, Response } from "express";
import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "@ticket-hub/common";

import { Ticket } from "../models/tickets";
import { TicketUpdatedPublisher } from "../events/publisher/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

/**
 * Controller to get update tickets by id
 * @param req - Express req fn
 * @param res - Express res fn
 */
export const updateTicketsController = async (req: Request, res: Response) => {
  const { params, body } = req;
  const { id: ticketId = "" } = params;

  /**
   * Input id validation
   */
  const mongooseIdType = new mongoose.Types.ObjectId(ticketId).toString();
  const isValidId = mongooseIdType === ticketId;
  if (!isValidId) {
    throw new BadRequestError("Invalid or missing ticket id");
  }

  /**
   * Validate if ticket exists
   */
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }

  /**
   * Validate if user is ticket owner
   */
  if (ticket.userId !== req.currentUser!.id) {
    throw new BadRequestError("The ticket does not belong to user");
  }

  /**
   * Validate if ticket hass been reserved
   */
  const isReserved = ticket.orderId;
  if (isReserved) {
    throw new BadRequestError("The ticket has been reserved");
  }

  /**
   * Update ticket
   */
  const dataToUpdate = {
    title: body.title,
    price: body.price,
  };
  const ticketUpdated = await Ticket.findByIdAndUpdate(
    { _id: ticketId },
    { $set: dataToUpdate },
    { new: true }
  );

  /**
   * Send event to topic: ticket:updated
   */
  await new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticketUpdated!.id,
    title: ticketUpdated!.title,
    price: ticketUpdated!.price,
    userId: ticketUpdated!.userId,
    version: ticketUpdated!.version,
  });

  return res.status(200).json(ticketUpdated);
};
