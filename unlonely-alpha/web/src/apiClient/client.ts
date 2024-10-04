// import {
//     ApolloClient,
//     HttpLink,
//     InMemoryCache,
//     NormalizedCacheObject,
//   } from "@apollo/client";
  import { InMemoryCache } from "@apollo/client/cache/inmemory/inMemoryCache";
import { NormalizedCacheObject } from "@apollo/client/cache/inmemory/types";
import { ApolloClient } from "@apollo/client/core/ApolloClient";
import { setContext } from "@apollo/client/link/context";
import { HttpLink } from "@apollo/client/link/http/HttpLink";
  import { getAccessToken } from "@privy-io/react-auth";
  import { useMemo } from "react";
  
  export interface Context {
    signedMessage?: string;
  }
  
  const fetchWithTimeout = (url: any, options = {}, timeout = 300000) => {
    const controller = new AbortController();
    const signal = controller.signal;
  
    const fetchPromise = fetch(url, { ...options, signal });
  
    const timeoutId = setTimeout(() => controller.abort(), timeout);
  
    return fetchPromise.finally(() => clearTimeout(timeoutId));
  };
  
  let apolloClient: ApolloClient<NormalizedCacheObject>;
  const server = String(process.env.NEXT_PUBLIC_DIGITAL_OCEAN_SERVER_URL);
  
  const authLink = setContext(async (_, { headers }) => {
    const token = await getAccessToken();
    const latestVerifiedAddress = headers["latest-verified-address"];
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        "latest-verified-address": latestVerifiedAddress || "",
      },
    };
  });
  
  const createAuthLink = (latestVerifiedAddress: string | null) => setContext(async (_, { headers }) => {
    const token = await getAccessToken();
    console.log("Setting latest-verified-address header:", latestVerifiedAddress);
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        "latest-verified-address": latestVerifiedAddress || "",
      },
    };
  });
  
  function createApolloClient() {
    const httpLink = new HttpLink({
      uri:
        process.env.NODE_ENV === "production"
          ? server
          : "http://localhost:4000/graphql",
      fetch: fetchWithTimeout,
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
    const _apolloClient = apolloClient ?? createApolloClient();
    console.log("latestVerifiedAddress initializeApollo", latestVerifiedAddress);
    const authLink = createAuthLink(latestVerifiedAddress);
  
    _apolloClient.setLink(
      authLink.concat(
        new HttpLink({
          uri:
            process.env.NODE_ENV === "production"
              ? server
              : "http://localhost:4000/graphql",
          fetch: fetchWithTimeout,
        })
      )
    );
  
    if (initialState) {
      const existingCache = _apolloClient.extract();
      _apolloClient.cache.restore({ ...existingCache, ...initialState });
    }
    if (typeof window === "undefined") return _apolloClient;
    if (!apolloClient) apolloClient = _apolloClient;
    return _apolloClient;
  }
  
  export function useApollo(
    initialState: InitialState,
    latestVerifiedAddress: string | null
  ) {
    const store = useMemo(
      () => initializeApollo(initialState, latestVerifiedAddress),
      [initialState, latestVerifiedAddress]
    );
    return store;
  }