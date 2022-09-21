import { Schema, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { TicketModel, TicketDoc } from '../types';

const ticketsSchema = new Schema(
  {
    title: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    userId: {
      type: String,
      require: true,
    },
    orderId: {
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
ticketsSchema.set('versionKey', 'version');
ticketsSchema.plugin(updateIfCurrentPlugin);

/**
 * Expose Tickets model
 */
export const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketsSchema);
