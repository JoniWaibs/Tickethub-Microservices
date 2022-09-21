import axios, { AxiosInstance } from 'axios';

/**
 * Create axios instance based on client side or server side request
 * @param - NextPage context
 * @returns - Axios instance
 */
const restClient = ({ req }: any): AxiosInstance => {
  if (typeof window === 'undefined') {
    /**
     * Server side requests
     */
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers, // From NextPage context (includes cookie)
    });
  }

  /**
   * Client side requests
   */
  return axios.create({ baseURL: '/' });
};

export default restClient;