import "../styles/globals.css";
import theme from "../styles/theme";

import { ChakraProvider } from "@chakra-ui/react";

import { ApolloProvider } from "@apollo/client";
import { createConfig, WagmiConfig, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import { ConnectKitProvider } from "connectkit";
import { AppProps } from "next/app";
import { NextPageContext } from "next";
import cookies from "next-cookies";

import { Mainnet, Goerli } from "../constants/networks";
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

  const { publicClient, webSocketPublicClient, chains } = configureChains(
    [Mainnet, Goerli],
    [
      alchemyProvider({
        apiKey: "45C69MoK06_swCglhy3SexohbJFogC9F",
      }),
      alchemyProvider({
        apiKey: "Yv5gKmch-fSlMcOygB5jgDbNd3PL5fSv",
      }),
      publicProvider(),
    ]
  );

  const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
    connectors: [
      new MetaMaskConnector({
        chains,
      }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName: "Unlonely",
        },
      }),
      new WalletConnectConnector({
        chains,
        options: {
          projectId: "unlonely",
          showQrModal: false,
        },
      }),
    ],
  });

  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig config={wagmiConfig}>
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
