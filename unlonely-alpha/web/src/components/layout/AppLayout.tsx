import {
  Box,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  ToastId,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ApolloError } from "@apollo/client";
import { useNetwork } from "wagmi";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";

import NextHead from "./NextHead";
import Header from "../navigation/Header";
import { NETWORKS } from "../../constants/networks";
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
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>();
  const { isStandalone, ready } = useUserAgent();
  const router = useRouter();

  const smallestDevice = useBreakpointValue({
    base: true,
    sm: false,
    md: false,
    xl: false,
  });

  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[0]
    );
  }, [network]);

  useEffect(() => {
    if (localNetwork) {
      if (localNetwork.config.chainId !== 1) {
        toastIdRef.current = toast({
          title: "wrong network",
          description: "please connect to the ethereum mainnet",
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
      } else {
        if (toastIdRef.current) {
          toast.close(toastIdRef.current);
        }
      }
    }
  }, [localNetwork]);

  return (
    <Box
      bgGradient="linear-gradient(90deg, #E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
      background="rgba(0, 0, 0, 0.65)"
    >
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
              <AddToHomeScreen />
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
