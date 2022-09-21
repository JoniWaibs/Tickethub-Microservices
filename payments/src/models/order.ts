import { Schema, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { OrderDoc, OrderModel } from '../types';

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
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
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

/**
 * Expose Order model
 */
export const Order = model<OrderDoc, OrderModel>('Order', orderSchema);
