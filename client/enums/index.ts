export const pages = {
  SIGN_UP_URL: "signup",
  SIGN_IN_URL: "signin",
  SIGN_OUT_URL: "signout",
  MY_ORDERS: "orders/list",
  TICKETS_NEW: "tickets/new",
};

export enum HTTP_METHODS {
  POST = "post",
  GET = "get",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
  OPTIONS = "options",
  HEAD = "head"
}

export const BASE_URL = "/api/users";

export const BASE_TICKETS_URL = "/api/tickets"

export const BASE_ORDER_URL = "/api/orders"

export const BASE_PAYMENTS_URL = "/api/payments"

export const PUBLISHABLE_STRIPE_KEY = 'k_test_51LePnwBj10Yfw5Uew8v9NHIQcEBuQ5sCTRAuciCyekUmzuPhliVyn6ockEDJ3zZv5XBatPvVDW8zjpWOFs7pFUNs00UG3OyFmC';