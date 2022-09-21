import { AxiosPromise } from 'axios';
import { NextPageContext } from 'next';
import restClient from '../api/build-client'
import { BASE_URL } from '../enums'

export class AuthService {
  private baseUrl = BASE_URL;

  /**
   * currentUser service
   * @param context - Context to make request
   * @returns - Axios promise
   */
  async getCurrentUser(context: NextPageContext): Promise<AxiosPromise> {
    const url = `${this.baseUrl}/currentuser`;

    return await restClient(context).get(url).then(res => res.data.currentUser).catch(() => ({ currentUser: null }));
  };
};