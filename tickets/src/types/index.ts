import mongoose from "mongoose";

/**
 * Thats describe a common ticket schema
 */
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

export interface TicketModel extends mongoose.Model<TicketDoc> {
  title: string;
  price: number;
  userId: string;
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
export type UserModel = Pick<BaseUserProperties, "id" | "email">;

/**
 * Global types
 */
export interface Global {
  signup: (userMock: UserModel) => string;
}
