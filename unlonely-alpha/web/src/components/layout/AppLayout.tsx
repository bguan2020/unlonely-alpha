import {
  Box,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
} from "@chakra-ui/react";
import { ApolloError } from "@apollo/client";

import NextHead from "./NextHead";
import Header from "../navigation/Header";
import MobileBanner from "../mobile/Banner";

type Props = {
  loading?: boolean;
  error?: ApolloError | string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  isCustomHeader: boolean;
};

const AppLayout: React.FC<Props> = ({
  children,
  loading = false,
  error,
  title,
  image,
  description,
  isCustomHeader,
}) => {
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
            title="Unlonely"
            image={image ? image : ""}
            description={description ? description : ""}
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
          <Skeleton minHeight="calc(100vh - 64px)" isLoaded={!loading}>
            {children}
          </Skeleton>
        </Box>
      </Grid>
    </>
  );
};

export default AppLayout;
