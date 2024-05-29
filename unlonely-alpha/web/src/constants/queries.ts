import { gql } from "@apollo/client";

export const GET_USER_QUERY = gql`
  query getUser($data: GetUserInput!) {
    getUser(data: $data) {
      address
      username
      signature
      powerUserLvl
      videoSavantLvl
      nfcRank
      FCImageUrl
      isFCUser
      isLensUser
      lensHandle
      lensImageUrl
      channel {
        slug
      }
    }
  }
`;

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

export const GET_UNCLAIMED_EVENTS_QUERY = gql`
  query GetUnclaimedEvents($data: GetUnclaimedEvents) {
    getUnclaimedEvents(data: $data) {
      sharesSubjectQuestion
      sharesSubjectAddress
      resultIndex
      options
      id
      eventState
      createdAt
      chainId
      channelId
    }
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
      livepeerPlaybackId
      livepeerStreamId
      streamKey
      isLive
      id
      name
      slug
      allowNFCs
      vibesTokenPriceRange
      pinnedChatMessages
      sharesEvent {
        sharesSubjectQuestion
        sharesSubjectAddress
        options
        chainId
        channelId
        eventState
        createdAt
        id
        resultIndex
      }
      owner {
        FCImageUrl
        lensImageUrl
        username
        address
      }
      roles {
        id
        userAddress
        role
      }
      playbackUrl
      chatCommands {
        command
        response
      }
    }
  }
`;

export const CHANNEL_STATIC_QUERY = gql`
  query ChannelStatic($slug: String!) {
    getChannelBySlug(slug: $slug) {
      awsId
      channelArn
      description
      livepeerPlaybackId
      livepeerStreamId
      streamKey
      isLive
      id
      name
      slug
      allowNFCs
      vibesTokenPriceRange
      pinnedChatMessages
      owner {
        FCImageUrl
        lensImageUrl
        username
        address
      }
      playbackUrl
      chatCommands {
        command
        response
      }
      roles {
        id
        userAddress
        role
      }
    }
  }
`;

export const CHANNEL_INTERACTABLE_QUERY = gql`
  query ChannelInteractable($slug: String!) {
    getChannelBySlug(slug: $slug) {
      sharesEvent {
        sharesSubjectQuestion
        sharesSubjectAddress
        options
        chainId
        channelId
        eventState
        createdAt
        id
        resultIndex
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

export const GET_GAMBLABLE_EVENT_USER_RANK_QUERY = gql`
  query GetGamblableEventUserRank($data: GetGamblableEventUserRankInput!) {
    getGamblableEventUserRank(data: $data)
  }
`;

export const GET_GAMBLABLE_EVENT_LEADERBOARD_BY_CHANNEL_ID_QUERY = gql`
  query GetGamblableEventLeaderboardByChannelId(
    $data: GetGamblableEventLeaderboardByChannelIdInput!
  ) {
    getGamblableEventLeaderboardByChannelId(data: $data) {
      chainId
      channelId
      id
      totalFees
      user {
        address
        username
      }
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

export const CHANNEL_FEED_QUERY = gql`
  query GetChannelFeed($data: ChannelFeedInput!) {
    getChannelFeed(data: $data) {
      id
      isLive
      name
      description
      slug
      owner {
        username
        address
        FCImageUrl
        lensImageUrl
      }
      thumbnailUrl
    }
  }
`;

export const NFC_FEED_QUERY = gql`
  query NFCFeed($data: NFCFeedInput!) {
    getNFCFeed(data: $data) {
      createdAt
      id
      videoLink
      videoThumbnail
      openseaLink
      score
      liked
      owner {
        username
        address
        FCImageUrl
        powerUserLvl
        videoSavantLvl
      }
      title
    }
  }
`;

export const GET_TEMP_TOKENS_QUERY = gql`
  query GetTempTokens($data: GetTempTokensInput) {
    getTempTokens(data: $data) {
      tokenAddress
      symbol
      streamerFeePercentage
      protocolFeePercentage
      ownerAddress
      name
      isAlwaysTradeable
      highestTotalSupply
      hasRemainingFundsForCreator
      hasHitTotalSupplyThreshold
      creationBlockNumber
      endUnixTimestamp
      channelId
      chainId
      transferredLiquidityOnExpiration
      id
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

export const GET_BASE_LEADERBOARD_QUERY = gql`
  query GetBaseLeaderboard {
    getBaseLeaderboard {
      id
      amount
      owner {
        address
        username
        FCImageUrl
        lensImageUrl
      }
    }
  }
`;

export const GET_LIVEPEER_STREAM_DATA_QUERY = gql`
  query GetLivepeerStreamData($data: GetLivepeerStreamDataInput!) {
    getLivepeerStreamData(data: $data) {
      streamKey
      record
      playbackId
      isActive
    }
  }
`;

export const GET_LIVEPEER_STREAM_SESSIONS_DATA_QUERY = gql`
  query GetLivepeerStreamSessionsData(
    $data: IGetLivepeerStreamSessionsDataInput!
  ) {
    getLivepeerStreamSessionsData(data: $data) {
      mp4Url
      id
      createdAt
      duration
    }
  }
`;

export const GET_LIVEPEER_VIEWERSHIP_METRICS_QUERY = gql`
query GetLivepeerViewershipMetrics($data: IGetLivepeerViewershipMetricsInput!) {
  getLivepeerViewershipMetrics(data: $data) {
    timestamp
    viewCount
    playtimeMins
    playbackId
  }
}
`

export const GET_CHANNEL_SEARCH_RESULTS_QUERY = gql`
  query GetChannelSearchResults($data: ChannelSearchInput!) {
    getChannelSearchResults(data: $data) {
      id
      isLive
      name
      description
      slug
      owner {
        username
        address
        FCImageUrl
        lensImageUrl
      }
      thumbnailUrl
    }
  }
`;

export const GET_BADGE_HOLDERS_BY_CHANNEL_QUERY = gql`
  query GetBadgeHoldersByChannel($data: GetBadgeHoldersByChannelInput!) {
    getBadgeHoldersByChannel(data: $data)
  }
`;

export const GET_CHANNELS_BY_OWNER_ADDRESS_QUERY = gql`
  query GetChannelsByOwnerAddress($ownerAddress: String!) {
    getChannelsByOwnerAddress(ownerAddress: $ownerAddress) {
      slug
      createdAt
      name
    }
  }
`;

export const GET_CHANNELS_BY_NUMBER_OF_BADGE_HOLDERS_QUERY = gql`
  query GetChannelsByNumberOfBadgeHolders {
    getChannelsByNumberOfBadgeHolders {
      channel {
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
        sharesEvent {
          sharesSubjectQuestion
          sharesSubjectAddress
          chainId
          channelId
          options
          eventState
          createdAt
          id
          resultIndex
        }
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
      }
      holders
    }
  }
`;
