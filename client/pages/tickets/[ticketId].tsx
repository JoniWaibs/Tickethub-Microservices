import { NextPageContext } from "next";
import { useRouter } from "next/router";
import { BASE_ORDER_URL, HTTP_METHODS } from "../../enums";
import useRequest from "../../hooks/use-request";
import { TicketsService } from "../../services";
import { ComponentProps, Order } from "../../types";

const TicketView = ({ ticket }: ComponentProps) => {
  const router = useRouter();
  const { doClientSideRequest, errors } = useRequest({
    url: `${BASE_ORDER_URL}`,
    method: HTTP_METHODS.POST,
    body: {
      id: String(ticket?.id),
    },
    onSuccess: (order: Order) => router.push('/orders/[orderId]', `/orders/${order.id}`)
  });

  return (
    <div>
      <h1>{ticket?.title || 'unknown'}</h1>
      <h4>Price: {ticket?.price || 'unknown'}</h4>
      {errors}
      <button onClick={() => doClientSideRequest()} className="btn btn-primary" disabled={!ticket}>
        Purchase
      </button>
    </div>
  )
}

TicketView.getInitialProps = async (context: NextPageContext) => {
  const { ticketId } = context.query;
  const ticket = await new TicketsService().getTicketById(context, String(ticketId)) || {};

  return {
    ticket,
  };
};

export default TicketView
