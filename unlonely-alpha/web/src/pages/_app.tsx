import { LiveblocksProvider } from "@liveblocks/react";
import { ChakraProvider } from "@chakra-ui/react";
import { ApolloProvider } from "@apollo/client";
import { Provider as WagmiProvider } from "wagmi";
import { createClient } from "@liveblocks/client";
import { AppProps } from "next/app";
import Head from "next/head";
import { NextPageContext } from "next";
import cookies from "next-cookies";

import { connectors } from "../connectors";
import { Cookies, useApollo } from "../apiClient/client";
import "../styles/globals.css";
import theme from "../styles/theme";

interface InitialProps {
  cookies: Cookies;
}

type Props = AppProps & InitialProps;

function App({ Component, pageProps, cookies }: Props) {
  const liveblocksClient = createClient({
    publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  });
  const apolloClient = useApollo(
    pageProps ? pageProps.initialApolloState : null,
    cookies
  );

  return (
    /**
     * Add a LiveblocksProvider at the root of your app
     * to be able to use Liveblocks react hooks in your components
     **/
    <LiveblocksProvider client={liveblocksClient}>
      <ChakraProvider theme={theme}>
        <WagmiProvider autoConnect connectors={connectors({ chainId: 1 })}>
          <ApolloProvider client={apolloClient}>
            <Head>
              <title>Unlonely</title>
              <meta name="robots" content="noindex" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
            </Head>
            <Component {...pageProps} />
          </ApolloProvider>
        </WagmiProvider>
      </ChakraProvider>
    </LiveblocksProvider>
  );
}

App.getInitialProps = ({ ctx }: { ctx: NextPageContext }): InitialProps => {
  return {
    cookies: cookies(ctx),
  };
};

export default App;
