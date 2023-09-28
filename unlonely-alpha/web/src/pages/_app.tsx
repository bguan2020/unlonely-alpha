import "../styles/globals.css";
import "../styles/fireworks.css";
import "../styles/bell.css";

import { ChakraProvider } from "@chakra-ui/react";
import { ApolloProvider } from "@apollo/client";
import { configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { AppProps } from "next/app";
import { NextPageContext } from "next";
import cookies from "next-cookies";
import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";

import { Base, Mainnet, Goerli, BaseGoerli } from "../constants/networks";
import { Cookies, useApollo } from "../apiClient/client";
import { UserProvider } from "../hooks/context/useUser";
import { ScreenAnimationsProvider } from "../hooks/context/useScreenAnimations";
import theme from "../styles/theme";
import { NetworkProvider } from "../hooks/context/useNetwork";

interface InitialProps {
  cookies: Cookies;
}

type Props = AppProps & InitialProps;

function App({ Component, pageProps, cookies }: Props) {
  const apolloClient = useApollo(
    pageProps ? pageProps.initialApolloState : null,
    cookies
  );

  const configureChainsConfig = configureChains(
    [Base, Mainnet, Goerli, BaseGoerli],
    [
      alchemyProvider({
        apiKey: "aR93M6MdEC4lgh4VjPXLaMnfBveve1fC",
      }),
      alchemyProvider({
        apiKey: "45C69MoK06_swCglhy3SexohbJFogC9F",
      }),
      alchemyProvider({
        apiKey: "Yv5gKmch-fSlMcOygB5jgDbNd3PL5fSv",
      }),
      alchemyProvider({
        apiKey: "deehmFS2ptkwC3DD_vo3wSBCDyHwHM5x",
      }),
      publicProvider(),
    ]
  );

  return (
    <ChakraProvider theme={theme}>
      <PrivyProvider
        appId={String(process.env.NEXT_PUBLIC_PRIVY_APP_ID)}
        config={{
          loginMethods: ["email", "wallet"],
          walletConnectCloudProjectId: "e16ffa60853050eaa9746f45acd2207a",
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          appearance: {
            theme: "#19162F",
            accentColor: "#6cff67",
            logo: "https://i.imgur.com/MNArpwV.png",
            showWalletLoginFirst: false,
          },
        }}
      >
        <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
          <ApolloProvider client={apolloClient}>
            <UserProvider>
              <ScreenAnimationsProvider>
                <NetworkProvider>
                  <Component {...pageProps} />
                </NetworkProvider>
              </ScreenAnimationsProvider>
            </UserProvider>
          </ApolloProvider>
        </PrivyWagmiConnector>
      </PrivyProvider>
    </ChakraProvider>
  );
}

App.getInitialProps = ({ ctx }: { ctx: NextPageContext }): InitialProps => {
  return {
    cookies: cookies(ctx),
  };
};

export default App;
