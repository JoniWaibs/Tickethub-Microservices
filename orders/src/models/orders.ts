import { Schema, model } from 'mongoose';
import { OrderStatus } from '@ticket-hub/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { OrderDoc, OrderModel } from '../types';

export { OrderStatus };

const ordersSchema = new Schema<OrderModel>(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    status: {
      type: String,
      require: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.CREATED,
    },
    expiresAt: {
      type: Schema.Types.Date,
    },
    userId: {
      type: String,
      require: true,
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
ordersSchema.set('versionKey', 'version');
ordersSchema.plugin(updateIfCurrentPlugin);

/**
 * Expose Orders model
 */
export const Order = model<OrderDoc, OrderModel>('Order', ordersSchema);
