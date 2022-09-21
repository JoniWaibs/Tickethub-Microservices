import { OrderStatus } from '@ticket-hub/common';
import mongoose from 'mongoose';

/**
 * Thats describe a common order schema
 */
export interface OrderDoc extends mongoose.Document {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

export interface OrderModel extends mongoose.Model<OrderDoc> {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

/**
 * Thats describe a common payments schema
 */
export interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

export interface PaymentModel extends mongoose.Model<PaymentDoc> {
  orderId: string;
  stripeId: string;
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
