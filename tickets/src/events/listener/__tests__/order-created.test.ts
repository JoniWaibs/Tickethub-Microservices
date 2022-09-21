import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@ticket-hub/common";

import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Ticket } from "../../../models/tickets";

describe("order-created listener", () => {
  let listener: any;
  let orderData: OrderCreatedEvent["data"];
  let payload: Message;
  let ticket: any;

  beforeEach(async () => {
    listener = new OrderCreatedListener(natsWrapper.client);

    ticket = new Ticket({
      version: 0,
      _id: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      title: "ticket-title",
      price: 100,
    });
    await ticket.save();

    orderData = {
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: "user-test",
      expiresAt: "expires-date",
      status: OrderStatus.CREATED,
      version: 0,
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

  test("find, add orderId and saves a updated ticket", async () => {
    /**On message event must find a ticket */
    await listener.onMessage(orderData, payload);

    /**Try to get a ticket */
    const ticketUpdated = await Ticket.findById(ticket.id);

    expect(ticketUpdated).toBeDefined();
    expect(ticketUpdated!.title).toEqual(ticket.title);
    expect(ticketUpdated!.price).toEqual(ticket.price);
    expect(ticketUpdated!.orderId).toEqual(orderData.id);
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
    expect(ticketUpdated!.orderId).toEqual(orderData.id);
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
