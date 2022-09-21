import { natsWrapper } from './nats-wrapper';

import { OrderCreatedListener } from './events/listeners/order-created-listener';

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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (error) {
    console.log({ Error: error });
    process.exit(1);
  }
};
start();
