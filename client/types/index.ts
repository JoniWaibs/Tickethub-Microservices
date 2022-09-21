import { OrderStatus } from '@ticket-hub/common';
import { HTTP_METHODS } from "../enums";

/**
 * Base user attributes
 */
interface BaseUserProperties {
  id: string;
  email: string;
  password: string;
}

/**
 * That describes the required user props
 */
export type UserModel = Omit<BaseUserProperties, "password">;

/**
 * Request hook types
 */
type RequestBodyType = string | number

export interface useRequestProps {
  url: string;
  method: HTTP_METHODS;
  body?: {
    [key: RequestBodyType]: RequestBodyType;
  };
  onSuccess: (data: any) => void;
}

/**
 * Error schema
 */
export interface Err {
  message?: string;
  field?: string;
}

/**
 * Tickets defs
 */
export interface Ticket {
  id: string;
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

/**
 * Oorder defs
 */
 export interface Order {
  id: string
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: Omit<Ticket, 'orderId' | 'userId'>;
  version: number;
}

/**
 * Base layout props
 */
export interface LayoutProps {
  children: JSX.Element;
  currentUser: UserModel | null;
}

export interface ComponentProps {
  currentUser?: UserModel | null;
  ticket?: Ticket;
  tickets?: Ticket[];
  order?: Order;
  orders?: Order[];
};
