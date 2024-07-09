import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const server = String(process.env.NEXT_PUBLIC_DIGITAL_OCEAN_SERVER_URL);

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NODE_ENV === "production"
    ? server
    : "http://localhost:4000/graphql",  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      errorPolicy: "all",
    },
  },
});

export default client;