import { gql } from "apollo-boost";
export const GET_SOCIAL = gql`
  query GetSocial(
    $identity: Identity!
    $identity: Identity!
    $blockchain: TokenBlockchain!
    $_eq: SocialDappName
    $_eq1: SocialDappName
  ) {
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
        input: { filter: { dappName: { _eq: $_eq } } }
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
      lensSocials: socials(input: { filter: { dappName: { _eq: $_eq1 } } }) {
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
