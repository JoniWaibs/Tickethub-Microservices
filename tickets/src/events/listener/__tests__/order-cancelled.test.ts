import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCancelledEvent } from "@ticket-hub/common";

import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Ticket } from "../../../models/tickets";

describe("order-cancelled listener", () => {
  let listener: any;
  let orderData: OrderCancelledEvent["data"];
  let payload: Message;
  let ticket: any;

  beforeEach(async () => {
    listener = new OrderCancelledListener(natsWrapper.client);

    ticket = new Ticket({
      version: 0,
      _id: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      title: "ticket-title",
      price: 100,
      orderId: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    orderData = {
      id: ticket.orderId,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    };

    //@ts-ignore
    payload = {
      ack: jest.fn(),
    };
  });

  test("find, mark as undefined orderId and saves a updated ticket", async () => {
    /**On message event must find a ticket */
    await listener.onMessage(orderData, payload);

    /**Try to get a ticket */
    const ticketUpdated = await Ticket.findById(ticket.id);

    expect(ticketUpdated).toBeDefined();
    expect(ticketUpdated!.orderId).not.toBeDefined();
  });

  test("send ack message", async () => {
    await listener.onMessage(orderData, payload);

    expect(payload.ack).toHaveBeenCalled();
  });

  test("publish a ticket updated event", async () => {
    await listener.onMessage(orderData, payload);

    /** Must call TicketUpdatedPublisher*/
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    /** Validate data with that publisher is calling */
    const ticketUpdated = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(ticketUpdated).toBeDefined();
    expect(ticketUpdated!.title).toEqual(ticket.title);
    expect(ticketUpdated!.price).toEqual(ticket.price);
    expect(ticketUpdated!.orderId).toEqual(undefined);
  });

  test("does not send ack message", async () => {
    /**Try to get a wrong ticket */
    orderData.ticket.id = new mongoose.Types.ObjectId().toHexString();

    try {
      await listener.onMessage(orderData, payload);
    } catch (error) {
      expect(error).toBeTruthy();
    }

    expect(payload.ack).not.toHaveBeenCalled();
  });
});
