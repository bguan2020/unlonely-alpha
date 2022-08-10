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

type Props = {
  loading?: boolean;
  error?: ApolloError | string;
};

const AppLayout: React.FC<Props> = ({ children, loading = false, error }) => {
  return (
    <Grid
      display={["grid"]}
      gridTemplateColumns={["1px auto"]}
      // gridTemplateRows={["none", "none", "max-content"]}
      bgGradient="linear(to-r, #e2f979, #b0e5cf, #ba98d7, #d16fce)"
    >
      <NextHead title="Unlonely" />
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
  );
};

export default AppLayout;
