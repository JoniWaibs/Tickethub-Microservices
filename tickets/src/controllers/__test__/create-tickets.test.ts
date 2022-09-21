import request from "supertest";
import { server } from "../../app";
import { BASE_API_URL } from "../../enums/api-url";
import { Ticket } from "../../models/tickets";
import { UserModel } from "../../types";
import { Global } from "../../types";
import { natsWrapper } from "../../nats-wrapper";

declare const global: Global;

describe("new tickets controller methods", () => {
  let cookie: string;
  let expected: any;
  let baseUrl: string;
  let authenticatedUserMock: UserModel;
  let ticketMock: any;

  beforeEach(() => {
    baseUrl = `${BASE_API_URL}`;
    authenticatedUserMock = {
      id: "id-1234",
      email: "test@test.com",
    };
    ticketMock = {
      title: "test title",
      price: 2400,
      userId: "id-1234",
    };
    /**
     * Signup and mock a valid user and get cookie
     */
    cookie = global.signup(authenticatedUserMock);
  });

  test("returns a 401 error when the user is not signed in", async () => {
    const response = await request(server).post(baseUrl).send({});

    expected = {
      errors: [{ message: "Unauthorized" }],
    };
    expect(response.status).toEqual(401);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test("returns an error if invalid title is provided", async () => {
    const fakeTicketSchema = { title: "", price: "2400" };
    const expected = {
      errors: [{ message: "Invalid or empty ticket title", field: "title" }],
    };
    const response = await request(server)
      .post(baseUrl)
      .set("Cookie", cookie)
      .send(fakeTicketSchema);
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test("returns an error if invalid price is provided", async () => {
    const fakeTicketSchema = { title: "ticket fake title", price: -20 };
    const expected = {
      errors: [{ message: "Price must be greater than 0", field: "price" }],
    };
    const response = await request(server)
      .post(baseUrl)
      .set("Cookie", cookie)
      .send(fakeTicketSchema);

    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test("create a new ticket with valid authenticated user and valid ticket schema", async () => {
    /**
     * Validate that BBDD does not have any tickets
     */
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    /**
     * Create a new ticket
     */
    const response = await request(server)
      .post(baseUrl)
      .set("Cookie", cookie)
      .send(ticketMock);
    expect(response.status).toEqual(201);

    /**
     * Validate that ticket has been saved
     */
    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(ticketMock.price);
    expect(tickets[0].title).toEqual(ticketMock.title);
    expect(tickets[0].userId).toEqual(ticketMock.userId);
  });

  test("publish an event after ticket is saved", async () => {
    /**
     * Create a new ticket
     */
    const response = await request(server)
      .post(baseUrl)
      .set("Cookie", cookie)
      .send(ticketMock);
    expect(response.status).toEqual(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
