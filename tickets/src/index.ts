import mongoose from 'mongoose';

import { server } from './app';
import { OrderCreatedListener } from './events/listener/order-created-listener';
import { OrderCancelledListener } from './events/listener/order-cancelled-listener';
import { natsWrapper } from './nats-wrapper';

const PORT = 3000;

/**
 * Nats wrapper connect options
 */
const natsClusterName = process.env.NATS_CLUSTER_NAME;
const natsClientId = process.env.NATS_CLIENT_ID;
const natsUrl = process.env.NATS_URL;

/**
 * Connect DDBB & nats-streaming-service
 */
const start = async () => {
  if (!process.env.JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY is missing');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');
  if (!process.env.NATS_CLUSTER_NAME) throw new Error('NATS_CLUSTER_NAME is missing');
  if (!process.env.NATS_CLIENT_ID) throw new Error('NATS_CLIENT_ID is missing');
  if (!process.env.NATS_URL) throw new Error('NATS_URL is missing');

  try {
    await natsWrapper.connect(String(natsClusterName), String(natsClientId), String(natsUrl));

    /**
     * on close event-bus implementation
     */
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    /**
     * Listening events
     */
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);

    console.log({ Info: `Connected to MongoDB` });
  } catch (error) {
    console.log({ Error: error });
    process.exit(1);
  }

  server.listen(PORT, () => console.log({ Info: `API V1 - tickets server is listening on ${PORT}` }));
};
start();
