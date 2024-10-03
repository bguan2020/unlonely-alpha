import "../styles/globals.css";
import "../styles/fireworks.css";
import "../styles/bell.css";
import "../styles/imageScroller.css";

// import { ChakraProvider, Flex, IconButton, Text } from "@chakra-ui/react";
// import { http } from "wagmi";
import { AppProps } from "next/app";
import { NextPageContext } from "next";
import cookies from "next-cookies";
import { PrivyProvider } from "@privy-io/react-auth";
import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import { QueryClient } from "@tanstack/react-query";

// import { FaArrowRight } from "react-icons/fa";
// import { FaArrowLeft } from "react-icons/fa";

// import { Base, Mainnet } from "../constants/networks";
// import theme from "../styles/theme";
// import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { UserProvider } from "../hooks/context/useUser";
import { ApolloProvider } from "../hooks/context/useApollo";
// import { TourProvider } from "@reactour/tour";
import { http } from "viem";
import { Base, Mainnet } from "../constants/networks";
import { QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export type Cookies = Record<string, string | undefined>;

interface InitialProps {
  cookies: Cookies;
}

type Props = AppProps & InitialProps;

// const tourStyles = {
//   highlightedArea: (base: any, { x, y }: any) => ({
//     ...base,
//     x: x + 10,
//     y: y + 10,
//   }),
//   maskArea: (base: any) => ({ ...base, rx: 15 }),
//   badge: (base: any) => ({
//     ...base,
//     color: "white",
//     background: "#0d9f08",
//     opacity: 0,
//   }),
//   popover: (base: any) => ({
//     ...base,
//     boxShadow: "0 0 3em rgba(0, 0, 0, 0.5)",
//     backgroundColor: "#2d2645",
//     borderRadius: 15,
//   }),
//   maskWrapper: (base: any) => ({ ...base, color: "#131323" }),
// };

// export const streamerTourSteps = [
//   {
//     selector: '[data-tour="s-step-1"]',
//     content: () => {
//       return (
//         <Flex direction="column" gap="10px">
//           <Text>go live right now</Text>
//           <Text>
//             allow camera & mic permissions (you can always turn either off later
//             if you prefer)
//           </Text>
//         </Flex>
//       );
//     },
//   },
//   {
//     selector: '[data-tour="s-step-2"]',
//     content: () => {
//       return (
//         <Flex direction="column" gap="10px">
//           <Text>screenshare using this button</Text>
//           <Text>click again to end screenshare</Text>
//         </Flex>
//       );
//     },
//   },
//   {
//     selector: '[data-tour="s-step-3"]',
//     content: () => {
//       return (
//         <Flex direction="column" gap="10px">
//           <Text>
//             if you don't want to stream directly from unlonely, you can use OBS
//             or another streaming software. here's your stream key & custom RTMP
//             URL
//           </Text>
//           <Text>
//             setup guide{" "}
//             <Link href="https://bit.ly/unlonelyOBSguide" target="_blank">
//               <Text as="span" textDecoration={"underline"} color="#3cd8ff">
//                 here
//               </Text>
//             </Link>
//           </Text>
//         </Flex>
//       );
//     },
//   },
//   {
//     selector: '[data-tour="s-step-4"]',
//     content: "give your stream a title & description",
//   },
//   {
//     selector: '[data-tour="s-step-5"]',
//     content: () => {
//       return (
//         <Flex direction="column" gap="10px">
//           <Text>
//             schedule your first stream by adding a new event to lu.ma/unlonely
//             to show up on our home page
//           </Text>
//           <Text>
//             pro tip: include your channel URL directly in the event description
//             for extra visibility!
//           </Text>
//         </Flex>
//       );
//     },
//   },
// ];

const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled
  // shouldAutoConnect: true,
  shouldAutoConnect: false,
});

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
    // <ChakraProvider theme={theme}>
    <PrivyProvider
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
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <ApolloProvider pageProps={pageProps}>
            {/* <TourProvider
                steps={streamerTourSteps}
                styles={tourStyles}
                prevButton={({ currentStep, setCurrentStep }) => {
                  const first = currentStep === 0;
                  if (first) return null;
                  return (
                    <IconButton
                      aria-label="tour-back"
                      icon={<FaArrowLeft />}
                      onClick={() => setCurrentStep((s) => s - 1)}
                      height="20px"
                      width="20px"
                      fontSize="10px"
                      _hover={{}}
                      _active={{}}
                      _focus={{}}
                    >
                      back
                    </IconButton>
                  );
                }}
                nextButton={({
                  currentStep,
                  stepsLength,
                  setIsOpen,
                  setCurrentStep,
                  steps,
                }) => {
                  const last = currentStep === stepsLength - 1;
                  return (
                    <IconButton
                      aria-label="tour-next"
                      icon={!last ? <FaArrowRight /> : <Text>close</Text>}
                      height="20px"
                      width="20px"
                      fontSize="10px"
                      bg={last ? "green" : "white"}
                      color={last ? "white" : "black"}
                      _hover={{}}
                      _active={{}}
                      _focus={{}}
                      onClick={() => {
                        if (last) {
                          setIsOpen(false);
                        } else {
                          setCurrentStep((s) =>
                            s === (steps?.length ?? 1) - 1 ? 0 : s + 1
                          );
                        }
                      }}
                    >
                      {last ? "finish" : "next"}
                    </IconButton>
                  );
                }}
              > */}
            <UserProvider>
              <Component {...pageProps} />
            </UserProvider>
            {/* </TourProvider> */}
          </ApolloProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
    // </ChakraProvider>
  );
}

App.getInitialProps = ({ ctx }: { ctx: NextPageContext }): InitialProps => {
  return {
    cookies: cookies(ctx),
  };
};

export default App;
