import { OrderStatus } from '@ticket-hub/common';
import mongoose from 'mongoose';

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

/**
 * Thats describe a common ticket schema
 */
export interface TicketModel extends mongoose.Model<TicketDoc> {
  id: string;
  title: string;
  price: number;
}

export interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

/**
 * Thats describe a common order schema
 */
export interface OrderModel extends mongoose.Model<OrderDoc> {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

/**
 * Base user attributes
 */
interface BaseUserProperties {
  id: string;
  email: string;
  password: string;
}

/**
 * Thats describes the required props to create new user
 */
export type UserModel = Pick<BaseUserProperties, 'id' | 'email'>;

/**
 * Global types
 */
export interface Global {
  signup: (userMock: UserModel) => string;
}
