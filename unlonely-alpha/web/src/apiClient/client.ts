import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getAccessToken } from "@privy-io/react-auth";
import { useMemo } from "react";

let apolloClient: ApolloClient<NormalizedCacheObject>;

const authLink = setContext(async (_, { headers }) => {
  const token = await getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

function createApolloClient(latestVerifiedAddress: string | null) {
  const server = String(process.env.NEXT_PUBLIC_DIGITAL_OCEAN_SERVER_URL);
  const httpLink = new HttpLink({
    uri:
      process.env.NODE_ENV === "production"
        ? server
        : "http://localhost:4000/graphql",
    headers: {
      "latest-verified-address": latestVerifiedAddress || "",
    },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        errorPolicy: "all",
      },
    },
    link: authLink.concat(httpLink),
  });
}

type InitialState = NormalizedCacheObject | null;

export function initializeApollo(
  initialState: InitialState = null,
  latestVerifiedAddress: string | null
) {
  const _apolloClient = apolloClient ?? createApolloClient(latestVerifiedAddress);

  if (initialState) {
    const existingCache = _apolloClient.extract();
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  if (typeof window === "undefined") return _apolloClient;
  if (!apolloClient) apolloClient = _apolloClient;
  return _apolloClient;
}

export function useApollo(initialState: InitialState, latestVerifiedAddress: string | null) {
  console.log("latestVerifiedAddress", latestVerifiedAddress);
  const store = useMemo(
    () => initializeApollo(initialState, latestVerifiedAddress),
    [initialState, latestVerifiedAddress]
  );
  return store;
}
