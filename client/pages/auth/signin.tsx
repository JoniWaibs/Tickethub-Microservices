import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { BASE_URL, HTTP_METHODS } from "../../enums";
import useRequest from "../../hooks/use-request";

const SignIn: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { doClientSideRequest, errors } = useRequest({
    url: `${BASE_URL}/signin`,
    method: HTTP_METHODS.POST,
    body: {
      email,
      password
    },
    onSuccess: () => router.push('/')
  });

  const onSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    await doClientSideRequest();
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="w-50 my-0 mx-auto">
        <h1 className="text-center">Sign In</h1>
        <div className="form-group">
          <label>Email Address</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary mt-3">Sign In</button>
      </div>
    </form>
  );
};

export default SignIn;