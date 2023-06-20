import { gql } from "@apollo/client";

export const CHANNEL_DETAIL_QUERY = gql`
  query ChannelDetail($slug: String!) {
    getChannelBySlug(slug: $slug) {
      awsId
      channelArn
      description
      id
      name
      slug
      allowNFCs
      owner {
        FCImageUrl
        lensImageUrl
        username
        address
      }
      token {
        id
        name
        symbol
        address
      }
      playbackUrl
    }
  }
`;

export const GET_RECENT_STREAM_INTERACTIONS_BY_CHANNEL_QUERY = gql`
  query GetRecentStreamInteractions(
    $data: GetRecentStreamInteractionsByChannelInput
  ) {
    getRecentStreamInteractionsByChannel(data: $data) {
      id
      interactionType
      text
      createdAt
      updatedAt
      owner {
        address
      }
    }
  }
`;

export const GET_TOKEN_HOLDERS_BY_CHANNEL_QUERY = gql`
  query GetTokenHoldersByChannel($data: GetTokenHoldersInput) {
    getTokenHoldersByChannel(data: $data) {
      quantity
      user {
        username
        address
      }
    }
  }
`;
