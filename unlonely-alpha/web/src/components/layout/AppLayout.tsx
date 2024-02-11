import {
  Box,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ApolloError } from "@apollo/client";
import { useRouter } from "next/router";

import NextHead from "./NextHead";
import Header from "../navigation/Header";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { Navbar } from "../mobile/Navbar";
import AddToHomeScreen from "../general/mobile-prompts/AddToHomeScreen";
import { useCacheContext } from "../../hooks/context/useCache";
import { useCallback, useEffect } from "react";

type Props = {
  loading?: boolean;
  error?: ApolloError | string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  isCustomHeader: boolean;
  pageUrl?: string | null;
  noHeader?: boolean;
};

const AppLayout: React.FC<Props> = ({
  children,
  loading = false,
  error,
  title,
  image,
  description,
  isCustomHeader,
  pageUrl,
  noHeader,
}) => {
  const { isStandalone, ready } = useUserAgent();
  const router = useRouter();
  const { mobileSizes, isFocusedOnInput, handleIsFocusedOnInput } =
    useCacheContext();

  const smallestDevice = useBreakpointValue({
    base: true,
    sm: false,
    md: false,
    xl: false,
  });

  const preventTouchMove = useCallback((e: any) => {
    // Check if the target of the touchmove event is the body or a child you want to disable
    if (
      !e.target.matches(".always-allow-touchmove, .always-allow-touchmove *")
    ) {
      // Prevent scrolling.
      e.preventDefault();
    }
  }, []);

  const disableScroll = () => {
    document.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });
  };

  const enableScroll = () => {
    document.removeEventListener("touchmove", preventTouchMove);
  };

  useEffect(() => {
    handleIsFocusedOnInput(undefined);
  }, [router.pathname]);

  /* when the keyboard is visible on the channel page, scroll to the bottom of the page, and disable scroll
  to keep the input and video component in view, please refer to the video component for more details
  */
  useEffect(() => {
    if (
      (mobileSizes.keyboardVisible || isFocusedOnInput) &&
      router.pathname.startsWith("/channels") &&
      isStandalone &&
      window
    ) {
      const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight,
        window.screen.height
      );
      window.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
      disableScroll();
    } else {
      enableScroll();
    }
  }, [isFocusedOnInput, mobileSizes, router, isStandalone]);

  return (
    <Box background="rgba(0, 0, 0, 0.65)">
      {isCustomHeader === false && (
        <NextHead
          title={title ? title : ""}
          image={image ? image : ""}
          description={description ? description : ""}
          pageUrl={pageUrl ? pageUrl : ""}
        />
      )}
      {ready && (
        <>
          {!isStandalone ? (
            <>
              {!noHeader && <Header />}
              {!router.pathname.startsWith("/nfc") && <AddToHomeScreen />}
              <Box
                minW="100%"
                as="main"
                minH={
                  smallestDevice ? "calc(100vh - 25px)" : "calc(100vh - 48px)"
                }
              >
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle mr={2}>Network Error</AlertTitle>
                    <AlertDescription>{error.toString()}</AlertDescription>
                  </Alert>
                )}
                <Skeleton
                  isLoaded={!loading}
                  overflowX="hidden"
                  pb={noHeader ? "0px" : "20px"}
                >
                  {children}
                </Skeleton>
              </Box>
            </>
          ) : (
            <Box minW="100%" as="main" minH="100vh" gridColumnStart={2}>
              <Box
                background={"#19162F"}
                h={
                  !router.pathname.startsWith("/channels")
                    ? "calc(100vh - 103px)"
                    : "100vh"
                }
                overflowX="hidden"
              >
                {children}
              </Box>
              {!router.pathname.startsWith("/channels") && <Navbar />}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AppLayout;
