export const GET_SOCIAL = `
  query GetSocial($identity: Identity!, $blockchain: TokenBlockchain!) {
    Wallet(input: { identity: $identity, blockchain: $blockchain }) {
      addresses
      primaryDomain {
        name
      }
      domains {
        isPrimary
        name
        tokenNft {
          tokenId
          address
          blockchain
        }
        lastUpdatedBlockTimestamp
        createdAtBlockNumber
        createdAtBlockTimestamp
      }
      farcasterSocials: socials(
        input: { filter: { dappName: { _eq: farcaster } } }
      ) {
        isDefault
        blockchain
        profileName
        profileHandle
        profileImage
        followerCount
        followingCount
        profileTokenId
        profileTokenAddress
        profileImageContentValue {
          image {
            small
          }
        }
      }
      lensSocials: socials(input: { filter: { dappName: { _eq: lens } } }) {
        isDefault
        blockchain
        profileName
        profileHandle
        profileImage
        followerCount
        followingCount
        profileTokenId
        profileTokenAddress
        profileImageContentValue {
          image {
            small
          }
        }
      }
      xmtp {
        isXMTPEnabled
      }
    }
  }
`;
