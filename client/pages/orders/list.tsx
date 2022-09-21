import { NextPageContext } from "next";
import { OrdersService } from "../../services";
import { ComponentProps, Order } from "../../types";

const List = ({ orders }: ComponentProps) => {
  return (
    <div>
      <ul>
        {orders?.map((order: Order) => {
          return (
            <li key={order.id}>
              {order.ticket.title} - {order.status}
            </li>
          );
        })}
      </ul>
    </div>
  )
}

List.getInitialProps = async (context: NextPageContext) => {
  const orders = await new OrdersService().getAll(context) || [];

  return {
    orders,
  }
};

export default List;
