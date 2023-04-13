import { gql } from 'graphql-request';

export const CHANNEL_FEED_QUERY = gql`
  query GetChannelFeed {
    getChannelFeed {
      awsId
      isLive
      name
      owner {
        FCImageUrl
        address
        username
        lensImageUrl
      }
      slug
      thumbnailUrl
    }
  }
`;
