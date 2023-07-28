import {
  Box,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  useToast,
  ToastId,
} from "@chakra-ui/react";
import { ApolloError } from "@apollo/client";
import { useNetwork } from "wagmi";
import { useEffect, useMemo, useRef } from "react";

import NextHead from "./NextHead";
import Header from "../navigation/Header";
import MobileBanner from "../mobile/Banner";
import { NETWORKS } from "../../constants/networks";

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
    <>
      <MobileBanner />
      <Grid
        display={["grid"]}
        gridTemplateColumns={["1px auto"]}
        // bgGradient="linear(to-r, #e2f979, #b0e5cf, #ba98d7, #d16fce)"
        bgGradient="linear-gradient(90deg, #E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
        background="rgba(0, 0, 0, 0.65)"
      >
        {isCustomHeader === false ? (
          <NextHead
            title=""
            image={image ? image : ""}
            description={description ? description : ""}
            pageUrl={pageUrl ? pageUrl : ""}
          />
        ) : null}
        <Header />
        <Box
          mt="60px"
          minW="100%"
          as="main"
          minH="calc(100vh - 48px)"
          gridColumnStart={2}
        >
          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle mr={2}>Network Error</AlertTitle>
              <AlertDescription>{error.toString()}</AlertDescription>
            </Alert>
          )}
          <Skeleton
            minHeight="calc(100vh - 64px)"
            isLoaded={!loading}
            overflowX="hidden"
          >
            {children}
          </Skeleton>
        </Box>
      </Grid>
    </>
  );
};

export default AppLayout;
