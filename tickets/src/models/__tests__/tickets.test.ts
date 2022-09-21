import { Ticket } from "../tickets";

describe("tickets model", () => {
  test("implements optimistic concurrency control", async () => {
    // create an ticket instance
    const ticket = new Ticket({
      title: "ticket test",
      price: 5,
      userId: "1234",
    });

    // save ticket to DDBB
    await ticket.save();

    // fetch the ticket twice
    const fistInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make two separate changes to the tickets we fetched
    fistInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    // save the first fetched ticket
    await fistInstance!.save();
    // save the second fetched ticket and launch error
    try {
      await secondInstance!.save();
    } catch (err) {
      return;
    }

    throw new Error("Error");
  });

  test("increments the version number on multiple saves", async () => {
    // create an ticket instance
    const ticket = new Ticket({
      title: "ticket test",
      price: 5,
      userId: "1234",
    });

    // save ticket to DDBB
    await ticket.save();
    // validate first version must be 0
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
  });
});
