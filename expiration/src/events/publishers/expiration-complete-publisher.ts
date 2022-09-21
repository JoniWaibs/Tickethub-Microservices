import { Publisher, Topics, ExpirationCompleteEvent } from '@ticket-hub/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  topic: Topics.ExpirationComplete = Topics.ExpirationComplete;
}
