import "../styles/globals.css";
import theme from "../styles/theme";

import { ChakraProvider } from "@chakra-ui/react";
import { ApolloProvider } from "@apollo/client";
import { createClient, WagmiConfig } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { AppProps } from "next/app";
import Head from "next/head";
import { NextPageContext } from "next";
import cookies from "next-cookies";

import { Cookies, useApollo } from "../apiClient/client";

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
      alchemyId: process.env.ALCHEMY_API_KEY,
    })
  );

  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={wagmiClient}>
        <ConnectKitProvider
          mode={"dark"}
          customTheme={{
            "--ck-font-family": "Anonymous Pro, sans-serif",
            "--ck-border-radius": 16,
          }}
        >
          <ApolloProvider client={apolloClient}>
            <Head>
              <title>Unlonely</title>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
            </Head>
            <Component {...pageProps} />
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
