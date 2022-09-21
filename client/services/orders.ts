import { AxiosPromise } from 'axios';
import { NextPageContext } from 'next';
import restClient from '../api/build-client'
import { BASE_ORDER_URL } from '../enums'

export class OrdersService {
  private baseUrl = BASE_ORDER_URL;

  /**
   * Retrieve all orders
   * @param context - Context to make request
   * @returns - Axios promise
   */
  async getAll(context: NextPageContext): Promise<AxiosPromise> {
    const url = `${this.baseUrl}`;

    return await restClient(context).get(url).then(res => res.data).catch((Error: any) => ({ Error }));
  };

  /**
   * Retrieve a order
   * @param context - Context to make request
   * @returns - Axios promise
   */
  async getOrderById(context: NextPageContext, orderId: string): Promise<AxiosPromise> {
    const url = `${this.baseUrl}/${orderId}`;

    return await restClient(context).get(url).then(res => res.data).catch((Error: any) => ({ Error }));
  };
}