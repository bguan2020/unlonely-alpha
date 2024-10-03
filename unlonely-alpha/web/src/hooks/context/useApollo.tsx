import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ApolloProvider as ApolloClientProvider } from "@apollo/client";
import { useApollo } from "../../apiClient/client";

export const useApolloContext = () => {
  return useContext(ApolloContext);
};

const ApolloContext = createContext<{
  handleLatestVerifiedAddress: (address: string | null) => void;
}>({
  handleLatestVerifiedAddress: () => undefined,
});

export const ApolloProvider = ({
  pageProps,
  children,
}: {
  pageProps: any;
  children: React.ReactNode;
}) => {
  const [latestVerifiedAddress, setLatestVerifiedAddress] = useState<
    string | null
  >(null);

  const apolloClient = useApollo(
    pageProps?.initialApolloState ?? null,
    latestVerifiedAddress
  );

  const handleLatestVerifiedAddress = useCallback((address: string | null) => {
    setLatestVerifiedAddress(address);
  }, []);

  const value = useMemo(
    () => ({ handleLatestVerifiedAddress, latestVerifiedAddress }),
    [handleLatestVerifiedAddress, latestVerifiedAddress]
  );

  return (
    <ApolloContext.Provider value={value}>
      <ApolloClientProvider client={apolloClient}>
        {children}
      </ApolloClientProvider>
    </ApolloContext.Provider>
  );
};
