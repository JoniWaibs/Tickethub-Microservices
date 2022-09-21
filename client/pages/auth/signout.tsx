import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { BASE_URL, HTTP_METHODS } from '../../enums';
import useRequest from '../../hooks/use-request';

const SignOut: NextPage = () => {
  const router = useRouter();
  const { doClientSideRequest } = useRequest({
    url: `${BASE_URL}/signout`,
    method: HTTP_METHODS.POST,
    body: {},
    onSuccess: () => router.push('/')
  });

  useEffect(() => {
    doClientSideRequest();
  }, []);

  return <div>Signing you out...</div>;
};

export default SignOut;