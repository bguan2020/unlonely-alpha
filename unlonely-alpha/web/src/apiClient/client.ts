import {
  ApolloClient,
  // ApolloLink,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useMemo } from "react";
// import cookieCutter from "cookie-cutter";
// import pickBy from "lodash/pickBy";
import { getAccessToken } from "@privy-io/react-auth";

let apolloClient: ApolloClient<NormalizedCacheObject>;

export type Cookies = Record<string, string | undefined>;

export interface Context {
  signedMessage?: string;
}

// Generate a random string
function generateRandomId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// const authLink = (cookies: Cookies, isSSR?: boolean) =>
//   new ApolloLink((operation, forward) => {
//     /**
//      * Next.js doesn't make cookies available in the same way that they're available in
//      * the browser, so we have to attempt to get the cookies in two different ways.
//      *
//      * This is due to SSR – when we first fetch the page, Next renders the page
//      * without a `document` being available (which is how cookies are fetched with
//      * normal JS).
//      *
//      * Instead, when rendering with SSR,  Next.js makes cookies available via the
//      * context object returned from getInitialProps. We call this and fetch the cookies
//      * in _app.tsx, and then pass the cookies all the way through to this auth link.
//      *
//      * In the browser (i.e. when we make requests as we're navigating the React app, as
//      * opposed to fetching it), we have to get the latest address via a cookie from the
//      * the document.
//      *
//      * Hence we have this method of getting the relevant cookie in two ways.
//      */
//     // const browserAddressCookie = useCookies("unlonelyAddress");
//     /* eslint-disable no-console */
//     let address: string | undefined;
//     const nextAddressCookie = cookies["unlonelyAddress"];
//     console.log(nextAddressCookie, isSSR);
//     if (nextAddressCookie) {
//       address = nextAddressCookie;
//     } else if (isSSR && isSSR === true && !nextAddressCookie) {
//       console.log("hitting this");
//       address = undefined;
//     } else {
//       const browserAddressCookie = cookieCutter.get("unlonelyAddress");
//       address = browserAddressCookie || nextAddressCookie;
//     }

//     const { signedMessage } = operation.getContext() as Context;

//     const headers = {
//       "x-auth-address": address || undefined,
//       "x-auth-signed-message": signedMessage || undefined,
//     };

//     operation.setContext({
//       // Remove undef values from the headers as weirdly these get sent as "undefined"
//       headers: pickBy(headers),
//     });

//     return forward(operation);
//   });

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
