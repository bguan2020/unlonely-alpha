import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const server = "https://sea-lion-app-j3rts.ondigitalocean.app/graphql";

const client = new ApolloClient({
  link: new HttpLink({
    uri: server, 
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      errorPolicy: "all",
    },
  },
});

export default client;