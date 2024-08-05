import nodeFetch from "node-fetch"

const url = "https://api.goldsky.com/api/public/project_clhk16b61ay9t49vm6ntn4mkz/subgraphs/zora-create-base-mainnet/stable/gn"

const query = `
  query GetTokens($ids: [String!]!) {
    tokens(where: { id_in: $ids }) {
      id
      address
      tokenId
      totalMinted
    }
  }
`;

export const fetchZoraMints = async (ids: string[]) => {

    const body = JSON.stringify({
      query,
      variables: { ids },
    });

    try {
      // Make the POST request to the GraphQL endpoint
      const response = await nodeFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
  
      // Parse the response as JSON
      const data = await response.json();
  
      // Handle errors if the response includes any
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
      }
  
      // Log the data
      console.log("GraphQL data:", data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
}