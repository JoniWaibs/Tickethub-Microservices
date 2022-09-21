import { PaymentCreatedEvent, Publisher, Topics } from '@ticket-hub/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  topic: Topics.PaymentCreated = Topics.PaymentCreated;
}
