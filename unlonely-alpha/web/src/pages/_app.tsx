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
      infuraId: "3b2a738fb8834266ba5a7538efe46d7e",
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
          options={{
            hideTooltips: true,
            hideQuestionMarkCTA: true,
            hideNoWalletCTA: true,
          }}
        >
          <ApolloProvider client={apolloClient}>
            <UserProvider>
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
