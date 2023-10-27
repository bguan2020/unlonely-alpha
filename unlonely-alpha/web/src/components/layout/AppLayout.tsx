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
import { useEffect } from "react";

import NextHead from "./NextHead";
import Header from "../navigation/Header";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { Navbar } from "../mobile/Navbar";
import AddToHomeScreen from "../general/mobile-prompts/AddToHomeScreen";

type Props = {
  loading?: boolean;
  error?: ApolloError | string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  isCustomHeader: boolean;
  pageUrl?: string | null;
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
}) => {
  const { isStandalone, ready } = useUserAgent();
  const router = useRouter();

  const smallestDevice = useBreakpointValue({
    base: true,
    sm: false,
    md: false,
    xl: false,
  });

  useEffect(() => {
    if (router.pathname.startsWith("/channels")) {
      document.body.style.backgroundImage = "none";
      document.body.style.background = "rgba(24, 22, 47, 1)";
    } else {
      document.body.style.backgroundImage =
        "linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)),linear-gradient(90deg, #E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)";
    }
  }, [router.pathname]);

  return (
    <Box>
      {isCustomHeader === false && (
        <NextHead
          title=""
          image={image ? image : ""}
          description={description ? description : ""}
          pageUrl={pageUrl ? pageUrl : ""}
        />
      )}
      {ready && (
        <>
          {!isStandalone ? (
            <>
              <Header />
              {!router.pathname.startsWith("/nfc") && <AddToHomeScreen />}
              <Box minW="100%" as="main">
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle mr={2}>Network Error</AlertTitle>
                    <AlertDescription>{error.toString()}</AlertDescription>
                  </Alert>
                )}
                <Skeleton isLoaded={!loading} overflowX="hidden">
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
