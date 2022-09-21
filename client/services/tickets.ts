import { AxiosPromise } from 'axios';
import { NextPageContext } from 'next';
import restClient from '../api/build-client'
import { BASE_TICKETS_URL } from '../enums'

export class TicketsService {
  private baseUrl = BASE_TICKETS_URL;

  /**
   * Retrieve all tickets
   * @param context - Context to make request
   * @returns - Axios promise
   */
  async getAll(context: NextPageContext): Promise<AxiosPromise> {
    const url = `${this.baseUrl}`;

    return await restClient(context).get(url).then(res => res.data).catch((Error: any) => ({ Error }));
  };

  /**
   * Retrieve a ticket
   * @param context - Context to make request
   * @returns - Axios promise
   */
  async getTicketById(context: NextPageContext, ticketId: string): Promise<AxiosPromise> {
    const url = `${this.baseUrl}/${ticketId}`;

    return await restClient(context).get(url).then(res => res.data).catch((Error: any) => ({ Error }));
  };
}