import { Schema, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { PaymentDoc, PaymentModel } from '../types';

const paymentSchema = new Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
    },
  },
  {
    toJSON: {
      /**
       * Mongoose will transform the returned object
       * @param _doc
       * @param ret
       */
      transform(_doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

/**
 * Set versionate strategy
 */
paymentSchema.set('versionKey', 'version');
paymentSchema.plugin(updateIfCurrentPlugin);

/**
 * Expose Payment model
 */
export const Payment = model<PaymentDoc, PaymentModel>('Payment', paymentSchema);
