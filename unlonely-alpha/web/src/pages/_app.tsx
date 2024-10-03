import "../styles/globals.css";
import "../styles/fireworks.css";
import "../styles/bell.css";
import "../styles/imageScroller.css";

import { ChakraProvider } from "@chakra-ui/react";
import { http } from "wagmi";
import { AppProps } from "next/app";
import { NextPageContext } from "next";
import cookies from "next-cookies";
// import { PrivyProvider } from "@privy-io/react-auth";
import { createConfig } from "@privy-io/wagmi";
// import { QueryClient } from "@tanstack/react-query";

import { Base, Mainnet } from "../constants/networks";
import theme from "../styles/theme";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { UserProvider } from "../hooks/context/useUser";

// const queryClient = new QueryClient();

export type Cookies = Record<string, string | undefined>;

interface InitialProps {
  cookies: Cookies;
}

type Props = AppProps & InitialProps;

// const solanaConnectors = toSolanaWalletConnectors({
//   // By default, shouldAutoConnect is enabled
//   // shouldAutoConnect: true,
//   shouldAutoConnect: false,
// });

function App({ Component, pageProps }: Props) {
  const config = createConfig({
    chains: [Base, Mainnet],
    transports: {
      [Base.id]: http(
        `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_BASE_API_KEY}`
      ),
      [Mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
      ),
    },
  });

  // useLogin from privy to detect user login and with what address, use this callback to update the user context on the backend
  return (
    <ChakraProvider theme={theme}>
      {/* <PrivyProvider
        appId={String(process.env.NEXT_PUBLIC_PRIVY_APP_ID)}
        config={{
          defaultChain: Base,
          loginMethods: ["email", "wallet"],
          walletConnectCloudProjectId: "e16ffa60853050eaa9746f45acd2207a",
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          appearance: {
            theme: "#19162F",
            accentColor: "#6cff67",
            logo: "/icons/icon-192x192.png",
            showWalletLoginFirst: false,
            walletChainType: "ethereum-and-solana",
          },
          // support for coinbase smart wallets, still in testing
          externalWallets: {
            coinbaseWallet: {
              connectionOptions: "all",
            },
            solana: {
              connectors: solanaConnectors,
            },
          },
        }}
      > */}
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
      {/* </PrivyProvider> */}
    </ChakraProvider>
  );
}

App.getInitialProps = ({ ctx }: { ctx: NextPageContext }): InitialProps => {
  return {
    cookies: cookies(ctx),
  };
};

export default App;
