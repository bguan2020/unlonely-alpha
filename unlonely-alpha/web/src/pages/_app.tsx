import "../styles/globals.css";
import "../styles/fireworks.css";
import "../styles/bell.css";

import { ChakraProvider, Flex, IconButton, Text } from "@chakra-ui/react";
import { ApolloProvider } from "@apollo/client";
import { configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { AppProps } from "next/app";
import { NextPageContext } from "next";
import cookies from "next-cookies";
import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

import { Base, NETWORKS } from "../constants/networks";
import { Cookies, useApollo } from "../apiClient/client";
import { UserProvider } from "../hooks/context/useUser";
import { ScreenAnimationsProvider } from "../hooks/context/useScreenAnimations";
import theme from "../styles/theme";
import { NetworkProvider } from "../hooks/context/useNetwork";
import { CacheProvider } from "../hooks/context/useCache";
import { TourProvider } from "@reactour/tour";
import Link from "next/link";

const tourStyles = {
  highlightedArea: (base: any, { x, y }: any) => ({
    ...base,
    x: x + 10,
    y: y + 10,
  }),
  maskArea: (base: any) => ({ ...base, rx: 15 }),
  badge: (base: any) => ({
    ...base,
    color: "white",
    background: "#0d9f08",
  }),
  popover: (base: any) => ({
    ...base,
    boxShadow: "0 0 3em rgba(0, 0, 0, 0.5)",
    backgroundColor: "#2d2645",
    borderRadius: 15,
  }),
};

export const streamerTourSteps = [
  {
    selector: '[data-tour="s-step-1"]',
    content: () => {
      return (
        <Flex direction="column" gap="10px">
          <Text>
            New to streaming? You can do it directly from your browser using the
            broadcaster here!
          </Text>
          <Text>
            Or if you are a seasoned streamer using OBS or other streaming
            software, get your stream key here!
          </Text>
          <Text>
            You can also change whether you want your stream to be recorded or
            clipped!
          </Text>
        </Flex>
      );
    },
  },
  {
    selector: '[data-tour="s-step-2"]',
    content: () => {
      return (
        <Flex direction="column" gap="10px">
          <Text>
            Have an idea of what your stream will be about? Give it a short,
            recognizable title!
          </Text>
          <Text>
            You can also provide extra details in the description or include
            bios of yourself and guests!
          </Text>
        </Flex>
      );
    },
  },
  {
    selector: '[data-tour="s-step-3"]',
    content:
      "If you want to create bets during streams for viewers to vote on (& earn 5% fees on all voting transactions), DM @brianguan98 for access!",
  },
  {
    selector: '[data-tour="s-step-4"]',
    content:
      "You can manage chat commands here! Great for FAQs or other helpful information!",
  },
  {
    selector: '[data-tour="s-step-5"]',
    content:
      "Add upcoming stream(s) to our calendar to show up on our home page. Include your channel URL for extra visibility!",
  },
  {
    selector: '[data-tour="s-step-6"]',
    content:
      "When you're live, send notifications to every subscribed to your channel on mobile!",
  },
  {
    selector: '[data-tour="s-step-7"]',
    content: () => {
      return (
        <Flex direction="column" gap="10px">
          <Text>
            You can see your chat moderators here! Great for keeping your chat
            in check!
          </Text>
          <Text>
            You can also add new moderators or ban users by clicking on someone
            in the chat!
          </Text>
        </Flex>
      );
    },
  },
  {
    selector: '[data-tour="s-step-8"]',
    content:
      "Viewers who purchase a VIP badge and chat moderators get access to the VIP only chat. As the channel owner, you are automatically a VIP!",
  },
  {
    selector: '[data-tour="s-step-9"]',
    content: () => {
      return (
        <Flex direction="column" gap="10px">
          <Text>
            For ideas on how to leverage $VIBES in your content, please speak
            with{" "}
            <Link
              href={"https://calendly.com/grace-unlonely/30min"}
              target="_blank"
            >
              <Text as="span" color="#3cd8ff">
                Grace
              </Text>
            </Link>
            .
          </Text>
          <Text>You earn 2% fees on transactions made on your channel!</Text>
        </Flex>
      );
    },
  },
  {
    selector: '[data-tour="s-step-10"]',
    content: () => {
      return (
        <Flex direction="column" gap="10px">
          <Text>
            We have more options here where you can update your socials here
            (ENS, PFP, Farcaster), claim payouts, and bridge ETH to base!
          </Text>
        </Flex>
      );
    },
  },
  {
    selector: '[data-tour="s-step-11"]',
    content:
      "To view these steps again later in the future, click this button!",
  },
];

export const viewerTourSteps = [
  {
    selector: '[data-tour="step-1"]',
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    selector: '[data-tour="step-2"]',
    content: "viewer step 2 Lorem ipsum dolor sit amet",
  },
  {
    selector: '[data-tour="step-3"]',
    content: "viewer step 3 Lorem ipsum dolor sit amet",
  },
];
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
    NETWORKS, // first chain in array determines the first chain to interact with via publicClient
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
          },
        }}
      >
        <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
          <ApolloProvider client={apolloClient}>
            <TourProvider
              steps={viewerTourSteps}
              styles={tourStyles}
              prevButton={({ currentStep, setCurrentStep, steps }) => {
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
            >
              <UserProvider>
                <ScreenAnimationsProvider>
                  <NetworkProvider>
                    <CacheProvider>
                      <Component {...pageProps} />
                    </CacheProvider>
                  </NetworkProvider>
                </ScreenAnimationsProvider>
              </UserProvider>
            </TourProvider>
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
