import {
  ApolloClient,
  // ApolloLink,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useMemo } from "react";
import { getAccessToken } from "@privy-io/react-auth";

let apolloClient: ApolloClient<NormalizedCacheObject>;

export type Cookies = Record<string, string | undefined>;

export interface Context {
  signedMessage?: string;
}

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await getAccessToken();
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

function createApolloClient(cookies: Cookies, isSSR?: boolean) {
  const server = String(process.env.NEXT_PUBLIC_DIGITAL_OCEAN_SERVER_URL);
  return new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        errorPolicy: "all",
      },
    },
    // link: ApolloLink.from([
    //   authLink(cookies, isSSR),
    //   new HttpLink({
    //     uri:
    //       process.env.NODE_ENV === "production"
    //         ? server
    //         : "http://localhost:4000/graphql",
    //   }),
    // ]),
    link: authLink.concat(
      new HttpLink({
        uri:
          process.env.NODE_ENV === "production"
            ? server
            : "http://localhost:4000/graphql",
      })
    ),
  });
}

type InitialState = NormalizedCacheObject | null;

export function initializeApollo(
  initialState: InitialState = null,
  cookies: Cookies,
  isSSR?: boolean
) {
  const _apolloClient = apolloClient ?? createApolloClient(cookies, isSSR);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;
  return _apolloClient;
}

export function useApollo(initialState: InitialState, cookies: Cookies) {
  const store = useMemo(
    () => initializeApollo(initialState, cookies),
    [cookies, initialState]
  );
  return store;
}
