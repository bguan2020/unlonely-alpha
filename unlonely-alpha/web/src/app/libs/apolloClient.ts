import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const server = process.env.NEXT_PUBLIC_DIGITAL_OCEAN_SERVER_URL;

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_DIGITAL_OCEAN_SERVER_URL || server, 
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      errorPolicy: "all",
    },
  },
});

export default client;