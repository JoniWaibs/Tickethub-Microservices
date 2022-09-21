import { Request, Response } from "express";
import mongoose from "mongoose";

import { Ticket } from "../models/tickets";
import { BadRequestError, NotFoundError } from "@ticket-hub/common";

export const getTicketsController = {
  /**
   * Controller to get all tickets
   * @param _req - Express req fn
   * @param res - Express res fn
   */
  getAllTickets: async (_req: Request, res: Response) => {
    const tickets = await Ticket.find({});

    res.status(200).json(tickets);
  },

  /**
   * Controller to get a unique ticket by ticket-id
   * @param req - Express req fn
   * @param res - Express res fn
   */
  getTicketById: async (req: Request, res: Response) => {
    const { id: ticketId = "" } = req.params;

    /**
     * Input id validation
     */
    const mongooseIdType = new mongoose.Types.ObjectId(ticketId).toString();
    const isValidId = mongooseIdType === ticketId;
    if (!isValidId) {
      throw new BadRequestError("Invalid or missing ticket id");
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    return res.status(200).json(ticket);
  },
};
