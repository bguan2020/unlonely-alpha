import { PrismaClient } from "@prisma/client";
import nodeFetch from "node-fetch"

const url = "https://api.goldsky.com/api/public/project_clhk16b61ay9t49vm6ntn4mkz/subgraphs/zora-create-base-mainnet/stable/gn"

const query = `
  query GetZoraCreateTokens($ids: [String!]!) {
    zoraCreateTokens(where: { id_in: $ids }, orderBy: address, orderDirection: asc) {
      id
      address
      tokenId
      totalMinted
    }
  }
`;

const prisma = new PrismaClient();

export const fetchZoraMints = async () => {
    // id is composed of ${contractAddress}-${tokenId}

    try {
    const nfcsWithContract1155Addresses = await prisma.nFC.findMany({
      where: {
        contract1155Address: {
          not: null,
        },
        tokenId: {
          not: -1,
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    // cap to 100 tokens
    const ids = nfcsWithContract1155Addresses
      .map((nfc) => {return {nfcId: nfc.id, zoraIdentifier: `${nfc.contract1155Address}-${nfc.tokenId}`}})
      .slice(0, 100).sort((a, b) => {
        // Sort by zoraIdentifier in ascending order
        if (a.zoraIdentifier < b.zoraIdentifier) return -1;
        if (a.zoraIdentifier > b.zoraIdentifier) return 1;
        return 0; // If they are equal
      });

    if (!ids.length) {
      return;
    }

    const body = JSON.stringify({
      query,
      variables: { ids: ids.map((id) => id.zoraIdentifier) },
    });

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

      const updatePromises: any[] = []

      data.data.zoraCreateTokens.forEach((token: any, i: number) => {
        if (token.id === ids[i].zoraIdentifier) {
          updatePromises.push(prisma.nFC.update({
            where: {
              id: ids[i].nfcId,
            },
            data: {
              totalMints: Number(token.totalMinted),
              updatedAt: new Date(),
            },
          }));
        }
      });
  
      await Promise.all(updatePromises);
  
      // Handle errors if the response includes any
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
      }

    } catch (error) {
      console.error("Fetch error:", error);
    }
}