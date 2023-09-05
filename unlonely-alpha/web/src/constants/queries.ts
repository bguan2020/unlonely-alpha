import { gql } from "@apollo/client";

export const GET_USER_TOKEN_HOLDING_QUERY = gql`
  query Query($data: GetUserTokenHoldingInput!) {
    getUserTokenHolding(data: $data)
  }
`;

export const SEND_ALL_NOTIFICATIONS_QUERY = gql`
  query SendAllNotifications($data: SendAllNotificationsInput!) {
    sendAllNotifications(data: $data)
  }
`;

export const GET_TOKEN_LEADERBOARD_QUERY = gql`
  query GetTokenLeaderboard {
    getTokenLeaderboard {
      symbol
      price
      name
      id
      holders
      address
      channel {
        slug
        owner {
          address
          username
        }
      }
    }
  }
`;

export const CHANNEL_DETAIL_QUERY = gql`
  query ChannelDetail($slug: String!) {
    getChannelBySlug(slug: $slug) {
      awsId
      channelArn
      description
      customButtonPrice
      customButtonAction
      isLive
      id
      name
      slug
      allowNFCs
      bannedUsers
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
      chatCommands {
        command
        response
      }
    }
  }
`;

export const CHANNEL_DETAIL_MOBILE_QUERY = gql`
  query ChannelDetailMobile($awsId: String!) {
    getChannelByAwsId(awsId: $awsId) {
      awsId
      channelArn
      description
      customButtonPrice
      customButtonAction
      isLive
      id
      name
      slug
      allowNFCs
      bannedUsers
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
      chatCommands {
        command
        response
      }
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

export const GET_ALL_DEVICE_TOKENS = gql`
  query GetAllDevices {
    getAllDevices {
      token
      notificationsLive
      notificationsNFCs
      address
    }
  }
`;

export const GET_ALL_USERS_WITH_CHANNEL = gql`
  query GetAllUsersWithChannel {
    getAllUsersWithChannel {
      address
      username
    }
  }
`;

export const CHECK_SUBSCRIPTION = gql`
  query CheckSubscription($data: ToggleSubscriptionInput!) {
    checkSubscriptionByEndpoint(data: $data)
  }
`;

export const GET_SUBSCRIPTION = gql`
  query GetSubscription($data: ToggleSubscriptionInput!) {
    getSubscriptionByEndpoint(data: $data) {
      allowedChannels
      softDelete
    }
  }
`;
