import Queue from 'bull';

import { natsWrapper } from '../nats-wrapper';
import { ORDER_EXPIRATION } from '../enums/constants';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>(ORDER_EXPIRATION, {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async job => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
