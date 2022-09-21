import { Schema, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { TicketDoc, TicketModel } from '../types';
import { Order, OrderStatus } from './orders';

const ticketsSchema = new Schema(
  {
    title: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
      min: 0,
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
ticketsSchema.set('versionKey', 'version');
ticketsSchema.plugin(updateIfCurrentPlugin);

/**
 * Validate if each order has ticket previously reserved
 * this === the ticket doc
 * @returns Promise<boolean>
 */
ticketsSchema.methods.isReserved = async function () {
  const orderExists = await Order.findOne({
    ticket: this,
    status: {
      $in: [OrderStatus.CREATED, OrderStatus.AWAITING_PAYMENT, OrderStatus.COMPLETE],
    },
  });

  return !!orderExists;
};

/**
 * Expose Tickets model
 */
export const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketsSchema);
