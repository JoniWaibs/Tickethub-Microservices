import axios from 'axios';
import { useState } from 'react';
import { Err, useRequestProps } from '../types';

/**
 * Handle client side request hook
 * @param {Object} - Config object
 * @returns
 */
const useRequest = ({ url, method, body, onSuccess }: useRequestProps) => {
  const [errors, setErrors] = useState<JSX.Element | null>(null);

  const doClientSideRequest = async (props: any = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, { ...body, ...props });

      if (onSuccess) onSuccess(response.data);

      return response.data;
    } catch (err: any) {
      console.log(err.response.data);
      setErrors(
        <div className="alert alert-danger mt-3">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err: Err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doClientSideRequest, errors };
};

export default useRequest;
