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
  const { mobileSizes, isFocusedOnInput } = useCacheContext();

  const smallestDevice = useBreakpointValue({
    base: true,
    sm: false,
    md: false,
    xl: false,
  });

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
                overflowY={
                  mobileSizes.keyboardVisible || isFocusedOnInput
                    ? "hidden"
                    : "unset"
                }
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
