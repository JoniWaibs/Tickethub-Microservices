import { NextPageContext } from "next";
import StripeCheckout from "react-stripe-checkout";
import { useEffect, useState } from "react";
import { OrdersService } from "../../services";
import { ComponentProps } from "../../types";
import useRequest from "../../hooks/use-request";
import { BASE_PAYMENTS_URL, HTTP_METHODS, PUBLISHABLE_STRIPE_KEY } from "../../enums";
import { useRouter } from "next/router";

const OrderView = ({ order, currentUser }: ComponentProps) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { doClientSideRequest, errors } = useRequest({
    url: `${BASE_PAYMENTS_URL}`,
    method: HTTP_METHODS.POST,
    body: {
      orderId: String(order?.id),
    },
    onSuccess: () => router.push('/orders/list')
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft: number | string = new Date(String(order?.expiresAt)).getTime() - new Date().getTime();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div className="alert alert-danger mt-3">Order Expired</div>;
  }

  const ticketAmount = order?.ticket?.price;

  return (
    <div>
      <h1>Order {order?.status}</h1>
      <div className="my-4">
        <h3>Ticket: {order?.ticket?.title} for USD { ticketAmount || 0 * 100 }</h3>
      </div>
      <div>
        <h6>Time left to pay: {timeLeft} seconds</h6>
      </div>
      { ticketAmount && (
        <StripeCheckout
          token={({ id }) => doClientSideRequest({ token: id })}
          stripeKey={PUBLISHABLE_STRIPE_KEY}
          amount={ticketAmount * 100}
          email={currentUser?.email}
        />
      )}
      {errors}
    </div>
  )
}

OrderView.getInitialProps = async (context: NextPageContext) => {
  const { orderId } = context.query;
  const order = await new OrdersService().getOrderById(context, String(orderId)) || {};

  return {
    order,
  };
};

export default OrderView
