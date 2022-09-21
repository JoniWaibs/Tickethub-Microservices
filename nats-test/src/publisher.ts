// import nats from 'node-nats-streaming';
// import { TicketCreatedPublisher } from './events/ticket-created-publisher';

// console.clear();
// const PORT = 4222;

// const client = nats.connect('tickethub', 'abc', { url: `http://localhost:${PORT}` });

// client.on('connect', async () => {
//   console.log('Publisher connected to NATS');

//   const data = {
//     id: '123',
//     title: 'concert',
//     price: 20,
//     userId: '',
//   };

//   const publisher = new TicketCreatedPublisher(client);

//   try {
//     await publisher.publish(data);
//   } catch (error) {
//     console.log(error);
//   }
// });
