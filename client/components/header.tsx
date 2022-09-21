import Link from 'next/link';

import { pages } from "../enums";
import { ComponentProps } from '../types';
import { urls } from '../utils/urls';

export const Header = ({ currentUser } : ComponentProps): JSX.Element => {
  const links = [
    !currentUser && { label: 'Sign Up', href: urls[pages.SIGN_UP_URL] },
    !currentUser && { label: 'Sign In', href: urls[pages.SIGN_IN_URL] },
    currentUser && { label: 'Sell Ticktes', href: urls[pages.TICKETS_NEW] },
    currentUser && { label: 'My Orders', href: urls[pages.MY_ORDERS] },
    currentUser && { label: 'Sign Out', href: urls[pages.SIGN_OUT_URL] }
  ].filter(linkConfig => linkConfig).map(({ label, href }: any) => {
    return (
      <li key={href} className="nav-item">
        <Link href={href}>
          <a className="nav-link">{label}</a>
        </Link>
      </li>
    );
  });

  return (
    <nav className="navbar navbar-light bg-light" >
      <div className="container-md">
        <Link href="/">
          <a className="navbar-brand">Ticket-Hub</a>
        </Link>

        <div className="d-flex justify-content-end">
          <ul className="nav d-flex align-items-center">{links}</ul>
        </div>
      </div>
    </nav>
  );
};
