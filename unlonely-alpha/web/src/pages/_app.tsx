import "../styles/globals.css";
import theme from "../styles/theme";

import { ChakraProvider } from "@chakra-ui/react";
import { ApolloProvider } from "@apollo/client";
import { createClient, WagmiConfig } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { AppProps } from "next/app";
import { NextPageContext } from "next";
import cookies from "next-cookies";

import { Cookies, useApollo } from "../apiClient/client";
import { UserProvider } from "../hooks/useUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface InitialProps {
  cookies: Cookies;
}

type Props = AppProps & InitialProps;

function App({ Component, pageProps, cookies }: Props) {
  const apolloClient = useApollo(
    pageProps ? pageProps.initialApolloState : null,
    cookies
  );

  const wagmiClient = createClient(
    getDefaultClient({
      appName: "Unlonely",
      autoConnect: true,
      alchemyId: "mo03KrWexuyEE6YFd4SzslmP4oWXNRVB",
    })
  );

  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={wagmiClient}>
        <ConnectKitProvider
          mode={"dark"}
          customTheme={{
            "--ck-font-family": "Anonymous Pro, sans-serif",
            "--ck-border-radius": 32,
          }}
        >
          <ApolloProvider client={apolloClient}>
            <UserProvider>
              <ToastContainer pauseOnHover={false} />
              <Component {...pageProps} />
            </UserProvider>
          </ApolloProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

App.getInitialProps = ({ ctx }: { ctx: NextPageContext }): InitialProps => {
  return {
    cookies: cookies(ctx),
  };
};

export default App;
