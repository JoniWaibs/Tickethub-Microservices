import 'bootstrap/dist/css/bootstrap.css';
import { AppProps } from 'next/app';
import { AuthService } from '../services';
import { Header } from "../components/header";
import { ComponentProps } from '../types';

interface CustomAppProps extends AppProps {
  currentUser: ComponentProps['currentUser']
}

const MyApp = ({ Component, pageProps, currentUser }: CustomAppProps) => {
  return (
    <>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </>
  )
}

MyApp.getInitialProps = async (appContext: any) => {
  const currentUser = await new AuthService().getCurrentUser(appContext.ctx);

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, currentUser);
  }

  return {
    pageProps,
    currentUser
  };
}

export default MyApp;
