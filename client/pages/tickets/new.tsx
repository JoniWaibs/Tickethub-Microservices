import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { BASE_TICKETS_URL, HTTP_METHODS } from "../../enums";
import useRequest from "../../hooks/use-request";

const NewTicket: NextPage = () => {
  const router = useRouter();
  const [ticketTitle, setTicketTitle] = useState<string>('');
  const [ticketPrice, setTicketPrice] = useState<string>('');
  const { doClientSideRequest, errors } = useRequest({
    url: `${BASE_TICKETS_URL}`,
    method: HTTP_METHODS.POST,
    body: {
      title: ticketTitle,
      price: ticketPrice,
    },
    onSuccess: () => router.push('/')
  });

  const onBlur = () => {
    const parsedValue = parseFloat(ticketPrice);

    if (isNaN(parsedValue)) return;

    setTicketPrice(parsedValue.toFixed(2));
  };

  const onSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    await doClientSideRequest();
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="w-50 my-0 mx-auto">
        <h1 className="text-center">New Ticket</h1>
        <div className="form-group">
          <label>Title</label>
          <input
            value={ticketTitle}
            onChange={e => setTicketTitle(e.target.value)}
            className="form-control"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={ticketPrice}
            onBlur={onBlur}
            onChange={e => setTicketPrice(e.target.value)}
            type="number"
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary mt-3">Create</button>
      </div>
    </form>
  )
}

export default NewTicket
