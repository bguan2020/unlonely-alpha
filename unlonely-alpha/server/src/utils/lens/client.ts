import ApolloClient, { gql } from "apollo-boost";
import fetch from "isomorphic-fetch";

export const lensClient = new ApolloClient({
  uri: "https://api.lens.dev/graphql",
  fetch,
});

export const LENS_GET_DEFAULT_PROFILE = gql`
  query DefaultProfile($ethereumAddress: EthereumAddress!) {
    defaultProfile(request: { ethereumAddress: $ethereumAddress }) {
      handle
      picture {
        ... on MediaSet {
          original {
            url
          }
        }
      }
    }
  }
`;
