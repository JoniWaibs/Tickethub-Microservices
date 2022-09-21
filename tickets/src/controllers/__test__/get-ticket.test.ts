import request from "supertest";

import { server } from "../../app";
import { BASE_API_URL } from "../../enums/api-url";
import { UserModel } from "../../types";
import { Global } from "../../types";

declare const global: Global;

describe("get ticket controller methods", () => {
  let cookie: string;
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

  test("returns 400 when ticket does not contain a valid id type", async () => {
    let response = await request(server).get(`${baseUrl}/not-valid-id`);

    const expected = {
      errors: [{ message: "Invalid or missing ticket id" }],
    };
    expect(response.status).toEqual(400);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test("returns 404 when ticket does not exists", async () => {
    let response = await request(server).get(
      `${baseUrl}/62b7c6adf9474e78ff36abb1`
    );

    const expected = {
      errors: [{ message: "Ticket not found" }],
    };
    expect(response.status).toEqual(404);
    expect(response.text).toEqual(JSON.stringify(expected));
  });

  test("retrieves a ticket by id", async () => {
    /**
     * Create a new tickets
     */
    const response = await request(server)
      .post(baseUrl)
      .set("Cookie", cookie)
      .send(ticketMock);
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();

    /**
     * Api call to find ticket by id
     */
    let ticketResponse = await request(server)
      .get(`${baseUrl}/${response.body.id}`)
      .set("Cookie", cookie)
      .send();
    expect(ticketResponse.body.title).toEqual(ticketMock.title);
    expect(ticketResponse.body.price).toEqual(ticketMock.price);
  });
});
