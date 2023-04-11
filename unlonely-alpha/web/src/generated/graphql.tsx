import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigInt: any;
  Byte: any;
  Currency: any;
  DID: any;
  Date: string;
  DateTime: any;
  Duration: any;
  EmailAddress: any;
  GUID: any;
  HSL: any;
  HSLA: any;
  HexColorCode: any;
  Hexadecimal: any;
  IBAN: any;
  IPv4: any;
  IPv6: any;
  ISBN: any;
  ISO8601Duration: any;
  JSON: any;
  JSONObject: any;
  JWT: any;
  Latitude: any;
  LocalDate: any;
  LocalEndTime: any;
  LocalTime: any;
  Long: any;
  Longitude: any;
  MAC: any;
  NegativeFloat: any;
  NegativeInt: any;
  NonEmptyString: any;
  NonNegativeFloat: any;
  NonNegativeInt: any;
  NonPositiveFloat: any;
  NonPositiveInt: any;
  ObjectID: any;
  PhoneNumber: any;
  Port: any;
  PositiveFloat: any;
  PositiveInt: any;
  PostalCode: any;
  RGB: any;
  RGBA: any;
  SafeInt: any;
  Time: any;
  Timestamp: any;
  URL: any;
  USCurrency: any;
  UUID: any;
  UnsignedFloat: any;
  UnsignedInt: any;
  UtcOffset: any;
  Void: any;
};

export type Channel = {
  __typename?: "Channel";
  awsId: Scalars["String"];
  channelArn?: Maybe<Scalars["String"]>;
  createdAt: Scalars["DateTime"];
  description?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  isLive?: Maybe<Scalars["Boolean"]>;
  name?: Maybe<Scalars["String"]>;
  owner: User;
  playbackUrl?: Maybe<Scalars["String"]>;
  slug: Scalars["String"];
  thumbnailUrl?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
};

export type ChannelFeedInput = {
  limit?: InputMaybe<Scalars["Int"]>;
  offset?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<SortBy>;
};

export type Chat = {
  __typename?: "Chat";
  channel: Channel;
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  owner: User;
  text: Scalars["String"];
  updatedAt: Scalars["DateTime"];
};

export type ClipOutput = {
  __typename?: "ClipOutput";
  errorMessage?: Maybe<Scalars["String"]>;
  thumbnail?: Maybe<Scalars["String"]>;
  url?: Maybe<Scalars["String"]>;
};

export type CreateClipInput = {
  channelArn: Scalars["String"];
};

export type GetChatInput = {
  channelId: Scalars["Int"];
  limit: Scalars["Int"];
};

export type GetPoapInput = {
  date: Scalars["String"];
};

export type GetUserInput = {
  address?: InputMaybe<Scalars["String"]>;
};

export type HandleLikeInput = {
  likableId: Scalars["ID"];
  likedObj: LikeObj;
  value: Scalars["Int"];
};

export type HostEvent = Likable & {
  __typename?: "HostEvent";
  challenge?: Maybe<HostEvent>;
  createdAt: Scalars["DateTime"];
  description?: Maybe<Scalars["String"]>;
  disliked?: Maybe<Scalars["Boolean"]>;
  hostDate: Scalars["DateTime"];
  id: Scalars["ID"];
  isChallenger: Scalars["Boolean"];
  liked?: Maybe<Scalars["Boolean"]>;
  owner: User;
  score: Scalars["Int"];
  title: Scalars["String"];
  updatedAt: Scalars["DateTime"];
};

export type HostEventFeedInput = {
  limit?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<SortOrder>;
};

export type Likable = {
  disliked?: Maybe<Scalars["Boolean"]>;
  id: Scalars["ID"];
  liked?: Maybe<Scalars["Boolean"]>;
  score: Scalars["Int"];
};

export type Like = {
  __typename?: "Like";
  disliked: Scalars["Boolean"];
  hostEvent?: Maybe<HostEvent>;
  id: Scalars["ID"];
  liked: Scalars["Boolean"];
  liker: User;
  nFC?: Maybe<Nfc>;
};

export enum LikeObj {
  Hostevent = "HOSTEVENT",
  Nfc = "NFC",
}

export type Mutation = {
  __typename?: "Mutation";
  _empty?: Maybe<Scalars["String"]>;
  createClip?: Maybe<ClipOutput>;
  handleLike?: Maybe<Likable>;
  openseaNFCScript?: Maybe<Scalars["String"]>;
  postChallenge?: Maybe<HostEvent>;
  postFirstChat?: Maybe<Chat>;
  postNFC?: Maybe<Nfc>;
  postStreamInteraction?: Maybe<StreamInteraction>;
  postTask?: Maybe<Task>;
  postVideo?: Maybe<Video>;
  softDeleteTask?: Maybe<Scalars["Boolean"]>;
  softDeleteVideo?: Maybe<Scalars["Boolean"]>;
  updateChannelText?: Maybe<Channel>;
  updateUserNotifications?: Maybe<User>;
};

export type MutationCreateClipArgs = {
  data?: InputMaybe<CreateClipInput>;
};

export type MutationHandleLikeArgs = {
  data: HandleLikeInput;
};

export type MutationPostChallengeArgs = {
  data: PostChallengeInput;
};

export type MutationPostFirstChatArgs = {
  data: PostChatInput;
};

export type MutationPostNfcArgs = {
  data: PostNfcInput;
};

export type MutationPostStreamInteractionArgs = {
  data: PostStreamInteractionInput;
};

export type MutationPostTaskArgs = {
  data: PostTaskInput;
};

export type MutationPostVideoArgs = {
  data: PostVideoInput;
};

export type MutationSoftDeleteTaskArgs = {
  id: Scalars["ID"];
};

export type MutationSoftDeleteVideoArgs = {
  id: Scalars["ID"];
};

export type MutationUpdateChannelTextArgs = {
  data: UpdateChannelTextInput;
};

export type MutationUpdateUserNotificationsArgs = {
  data: UpdateUserNotificationsInput;
};

export type Nfc = Likable & {
  __typename?: "NFC";
  createdAt: Scalars["DateTime"];
  disliked?: Maybe<Scalars["Boolean"]>;
  id: Scalars["ID"];
  liked?: Maybe<Scalars["Boolean"]>;
  openseaLink?: Maybe<Scalars["String"]>;
  owner: User;
  score: Scalars["Int"];
  title?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
  videoLink?: Maybe<Scalars["String"]>;
  videoThumbnail?: Maybe<Scalars["String"]>;
};

export type NfcFeedInput = {
  limit?: InputMaybe<Scalars["Int"]>;
  offset?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<SortBy>;
};

export type Poap = {
  __typename?: "Poap";
  createdAt: Scalars["DateTime"];
  date: Scalars["String"];
  id: Scalars["ID"];
  isUsed: Scalars["Boolean"];
  link?: Maybe<Scalars["String"]>;
  owner: User;
  updatedAt: Scalars["DateTime"];
};

export type PostChallengeInput = {
  description?: InputMaybe<Scalars["String"]>;
  hostDate: Scalars["DateTime"];
  originalHostEventId: Scalars["Int"];
  title: Scalars["String"];
};

export type PostChatInput = {
  channelId: Scalars["Int"];
  text: Scalars["String"];
};

export type PostNfcInput = {
  openseaLink: Scalars["String"];
  title: Scalars["String"];
  videoLink: Scalars["String"];
  videoThumbnail: Scalars["String"];
};

export type PostStreamInteractionInput = {
  interactionType: Scalars["String"];
};

export type PostTaskInput = {
  description?: InputMaybe<Scalars["String"]>;
  link?: InputMaybe<Scalars["String"]>;
  taskType: Scalars["String"];
  thumbnail?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
  youtubeId?: InputMaybe<Scalars["String"]>;
};

export type PostVideoInput = {
  description?: InputMaybe<Scalars["String"]>;
  duration?: InputMaybe<Scalars["Int"]>;
  thumbnail?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
  youtubeId?: InputMaybe<Scalars["String"]>;
};

export type Query = {
  __typename?: "Query";
  _empty?: Maybe<Scalars["String"]>;
  chatBot?: Maybe<Array<Maybe<Chat>>>;
  currentUser?: Maybe<User>;
  currentUserAuthMessage?: Maybe<Scalars["String"]>;
  firstChatExists?: Maybe<Scalars["Boolean"]>;
  getAllUsers?: Maybe<Array<Maybe<User>>>;
  getChannelById?: Maybe<Channel>;
  getChannelBySlug?: Maybe<Channel>;
  getChannelFeed?: Maybe<Array<Maybe<Channel>>>;
  getHostEventFeed?: Maybe<Array<Maybe<HostEvent>>>;
  getLeaderboard?: Maybe<Array<Maybe<User>>>;
  getNFC?: Maybe<Nfc>;
  getNFCFeed?: Maybe<Array<Maybe<Nfc>>>;
  getNextHostEvent?: Maybe<HostEvent>;
  getPoap?: Maybe<Poap>;
  getRecentChats?: Maybe<Array<Maybe<Chat>>>;
  getTaskFeed?: Maybe<Array<Maybe<Task>>>;
  getUser?: Maybe<User>;
  getVideo?: Maybe<Video>;
  getVideoFeed?: Maybe<Array<Maybe<Video>>>;
  updateAllUsers?: Maybe<Array<Maybe<User>>>;
};

export type QueryGetChannelByIdArgs = {
  id: Scalars["ID"];
};

export type QueryGetChannelBySlugArgs = {
  slug: Scalars["String"];
};

export type QueryGetChannelFeedArgs = {
  data?: InputMaybe<ChannelFeedInput>;
};

export type QueryGetHostEventFeedArgs = {
  data?: InputMaybe<HostEventFeedInput>;
};

export type QueryGetNfcArgs = {
  id: Scalars["ID"];
};

export type QueryGetNfcFeedArgs = {
  data?: InputMaybe<NfcFeedInput>;
};

export type QueryGetPoapArgs = {
  data?: InputMaybe<GetPoapInput>;
};

export type QueryGetRecentChatsArgs = {
  data: GetChatInput;
};

export type QueryGetTaskFeedArgs = {
  data?: InputMaybe<TaskFeedInput>;
};

export type QueryGetUserArgs = {
  data: GetUserInput;
};

export type QueryGetVideoArgs = {
  id: Scalars["ID"];
};

export type QueryGetVideoFeedArgs = {
  data?: InputMaybe<VideoFeedInput>;
};

export enum SortBy {
  CreatedAt = "createdAt",
  Score = "score",
}

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export type StreamInteraction = {
  __typename?: "StreamInteraction";
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  interactionType: Scalars["String"];
  owner: User;
  updatedAt: Scalars["DateTime"];
};

export type Task = {
  __typename?: "Task";
  completed: Scalars["Boolean"];
  createdAt: Scalars["DateTime"];
  description?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  isDeleted?: Maybe<Scalars["Boolean"]>;
  link?: Maybe<Scalars["String"]>;
  owner: User;
  taskType: Scalars["String"];
  thumbnail?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
  youtubeId?: Maybe<Scalars["String"]>;
};

export type TaskFeedInput = {
  limit?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<SortOrder>;
  searchString?: InputMaybe<Scalars["String"]>;
  skip?: InputMaybe<Scalars["Int"]>;
};

export type UpdateChannelTextInput = {
  description: Scalars["String"];
  id: Scalars["ID"];
  name: Scalars["String"];
};

export type UpdateUserNotificationsInput = {
  notificationsLive?: InputMaybe<Scalars["Boolean"]>;
  notificationsNFCs?: InputMaybe<Scalars["Boolean"]>;
  notificationsTokens?: InputMaybe<Scalars["String"]>;
};

export type User = {
  __typename?: "User";
  FCImageUrl?: Maybe<Scalars["String"]>;
  address: Scalars["String"];
  authedAsMe: Scalars["Boolean"];
  bio?: Maybe<Scalars["String"]>;
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  isFCUser: Scalars["Boolean"];
  isLensUser: Scalars["Boolean"];
  lensHandle?: Maybe<Scalars["String"]>;
  lensImageUrl?: Maybe<Scalars["String"]>;
  nfcRank: Scalars["Int"];
  notificationsLive?: Maybe<Scalars["Boolean"]>;
  notificationsNFCs?: Maybe<Scalars["Boolean"]>;
  notificationsTokens?: Maybe<Scalars["String"]>;
  powerUserLvl: Scalars["Int"];
  reputation?: Maybe<Scalars["Int"]>;
  sigTimestamp?: Maybe<Scalars["BigInt"]>;
  signature?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
  username?: Maybe<Scalars["String"]>;
  videoSavantLvl: Scalars["Int"];
};

export type Video = {
  __typename?: "Video";
  createdAt: Scalars["DateTime"];
  currentVideo: Scalars["Boolean"];
  description: Scalars["String"];
  duration: Scalars["Int"];
  id: Scalars["ID"];
  isDeleted: Scalars["Boolean"];
  liked?: Maybe<Scalars["Boolean"]>;
  owner: User;
  pause?: Maybe<Scalars["Int"]>;
  score: Scalars["Int"];
  skip?: Maybe<Scalars["Int"]>;
  skipped?: Maybe<Scalars["Boolean"]>;
  thumbnail: Scalars["String"];
  title: Scalars["String"];
  updatedAt: Scalars["DateTime"];
  youtubeId: Scalars["String"];
};

export type VideoFeedInput = {
  limit?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<SortOrder>;
  searchString?: InputMaybe<Scalars["String"]>;
  skip?: InputMaybe<Scalars["Int"]>;
};

export type GetPoapQueryVariables = Exact<{
  data: GetPoapInput;
}>;

export type GetPoapQuery = {
  __typename?: "Query";
  getPoap?: { __typename?: "Poap"; id: string; link?: string | null } | null;
};

export type HostEventCard_HostEventFragment = {
  __typename: "HostEvent";
  id: string;
  hostDate: any;
  title: string;
  description?: string | null;
  score: number;
  liked?: boolean | null;
  disliked?: boolean | null;
  owner: {
    __typename?: "User";
    username?: string | null;
    FCImageUrl?: string | null;
  };
  challenge?: {
    __typename?: "HostEvent";
    id: string;
    hostDate: any;
    title: string;
    description?: string | null;
    score: number;
    liked?: boolean | null;
    disliked?: boolean | null;
    owner: {
      __typename?: "User";
      username?: string | null;
      FCImageUrl?: string | null;
    };
  } | null;
};

export type TaskCard_TaskFragment = {
  __typename?: "Task";
  id: string;
  taskType: string;
  youtubeId?: string | null;
  title?: string | null;
  thumbnail?: string | null;
  description?: string | null;
  completed: boolean;
  createdAt: any;
  owner: { __typename?: "User"; username?: string | null; address: string };
};

export type TaskFeedQueryVariables = Exact<{
  data: TaskFeedInput;
}>;

export type TaskFeedQuery = {
  __typename?: "Query";
  getTaskFeed?: Array<{
    __typename?: "Task";
    id: string;
    taskType: string;
    youtubeId?: string | null;
    title?: string | null;
    thumbnail?: string | null;
    description?: string | null;
    link?: string | null;
    completed: boolean;
    owner: { __typename?: "User"; username?: string | null; address: string };
  } | null> | null;
};

export type VideoCard_VideoFragment = {
  __typename?: "Video";
  id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  description: string;
  score: number;
  duration: number;
  createdAt: any;
  liked?: boolean | null;
  owner: { __typename?: "User"; username?: string | null; address: string };
};

export type CreateClipMutationVariables = Exact<{
  data: CreateClipInput;
}>;

export type CreateClipMutation = {
  __typename?: "Mutation";
  createClip?: {
    __typename?: "ClipOutput";
    url?: string | null;
    thumbnail?: string | null;
    errorMessage?: string | null;
  } | null;
};

export type LikeMutationVariables = Exact<{
  data: HandleLikeInput;
}>;

export type LikeMutation = {
  __typename?: "Mutation";
  handleLike?:
    | {
        __typename?: "HostEvent";
        id: string;
        score: number;
        liked?: boolean | null;
        disliked?: boolean | null;
      }
    | {
        __typename?: "NFC";
        id: string;
        score: number;
        liked?: boolean | null;
        disliked?: boolean | null;
      }
    | null;
};

export type UseLike_HostEventFragment = { __typename: "HostEvent"; id: string };

export type PostFirstChatMutationVariables = Exact<{
  data: PostChatInput;
}>;

export type PostFirstChatMutation = {
  __typename?: "Mutation";
  postFirstChat?: { __typename?: "Chat"; id: string } | null;
};

export type PostNfcMutationVariables = Exact<{
  data: PostNfcInput;
}>;

export type PostNfcMutation = {
  __typename?: "Mutation";
  postNFC?: { __typename?: "NFC"; id: string } | null;
};

export type PostStreamInteractionMutationVariables = Exact<{
  data: PostStreamInteractionInput;
}>;

export type PostStreamInteractionMutation = {
  __typename?: "Mutation";
  postStreamInteraction?: {
    __typename?: "StreamInteraction";
    id: string;
  } | null;
};

export type PostTaskMutationVariables = Exact<{
  data: PostTaskInput;
}>;

export type PostTaskMutation = {
  __typename?: "Mutation";
  postTask?: { __typename?: "Task"; id: string } | null;
};

export type PostVideoMutationVariables = Exact<{
  data: PostVideoInput;
}>;

export type PostVideoMutation = {
  __typename?: "Mutation";
  postVideo?: { __typename?: "Video"; id: string } | null;
};

export type UpdateUserNotificationsMutationVariables = Exact<{
  data: UpdateUserNotificationsInput;
}>;

export type UpdateUserNotificationsMutation = {
  __typename?: "Mutation";
  updateUserNotifications?: {
    __typename?: "User";
    notificationsTokens?: string | null;
    notificationsLive?: boolean | null;
    notificationsNFCs?: boolean | null;
  } | null;
};

export type GetUserQueryVariables = Exact<{
  data: GetUserInput;
}>;

export type GetUserQuery = {
  __typename?: "Query";
  getUser?: {
    __typename?: "User";
    address: string;
    username?: string | null;
    signature?: string | null;
    bio?: string | null;
    powerUserLvl: number;
    videoSavantLvl: number;
    nfcRank: number;
    FCImageUrl?: string | null;
    isFCUser: boolean;
    isLensUser: boolean;
    lensHandle?: string | null;
    lensImageUrl?: string | null;
  } | null;
};

export type VideoFeed1808QueryVariables = Exact<{
  data: VideoFeedInput;
}>;

export type VideoFeed1808Query = {
  __typename?: "Query";
  getVideoFeed?: Array<{
    __typename?: "Video";
    id: string;
    title: string;
    thumbnail: string;
    description: string;
    score: number;
    createdAt: any;
    liked?: boolean | null;
    skipped?: boolean | null;
    owner: { __typename?: "User"; username?: string | null; address: string };
  } | null> | null;
};

export type ChannelDetailQueryVariables = Exact<{
  slug: Scalars["String"];
}>;

export type ChannelDetailQuery = {
  __typename?: "Query";
  getChannelBySlug?: {
    __typename?: "Channel";
    awsId: string;
    channelArn?: string | null;
    description?: string | null;
    id: string;
    name?: string | null;
    slug: string;
    playbackUrl?: string | null;
    owner: {
      __typename?: "User";
      FCImageUrl?: string | null;
      lensImageUrl?: string | null;
      username?: string | null;
    };
  } | null;
};

export type HostEventFeedQueryVariables = Exact<{
  data: HostEventFeedInput;
}>;

export type HostEventFeedQuery = {
  __typename?: "Query";
  getHostEventFeed?: Array<{
    __typename?: "HostEvent";
    id: string;
    hostDate: any;
    title: string;
    description?: string | null;
    score: number;
    liked?: boolean | null;
    disliked?: boolean | null;
    owner: {
      __typename?: "User";
      username?: string | null;
      FCImageUrl?: string | null;
    };
    challenge?: {
      __typename?: "HostEvent";
      id: string;
      hostDate: any;
      title: string;
      description?: string | null;
      score: number;
      liked?: boolean | null;
      disliked?: boolean | null;
      owner: {
        __typename?: "User";
        username?: string | null;
        FCImageUrl?: string | null;
      };
    } | null;
  } | null> | null;
};

export type NfcFeedQueryVariables = Exact<{
  data: NfcFeedInput;
}>;

export type NfcFeedQuery = {
  __typename?: "Query";
  getNFCFeed?: Array<{
    __typename?: "NFC";
    createdAt: any;
    id: string;
    videoLink?: string | null;
    videoThumbnail?: string | null;
    openseaLink?: string | null;
    score: number;
    liked?: boolean | null;
    title?: string | null;
    owner: {
      __typename?: "User";
      username?: string | null;
      address: string;
      FCImageUrl?: string | null;
      powerUserLvl: number;
      videoSavantLvl: number;
    };
  } | null> | null;
};

export type GetAllUsersQueryVariables = Exact<{ [key: string]: never }>;

export type GetAllUsersQuery = {
  __typename?: "Query";
  getAllUsers?: Array<{
    __typename?: "User";
    username?: string | null;
    address: string;
    notificationsTokens?: string | null;
    notificationsLive?: boolean | null;
    notificationsNFCs?: boolean | null;
  } | null> | null;
};

export type NfcDetailQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type NfcDetailQuery = {
  __typename?: "Query";
  getNFC?: {
    __typename?: "NFC";
    id: string;
    title?: string | null;
    videoLink?: string | null;
    openseaLink?: string | null;
    videoThumbnail?: string | null;
    score: number;
    liked?: boolean | null;
    updatedAt: any;
    owner: {
      __typename?: "User";
      address: string;
      FCImageUrl?: string | null;
      username?: string | null;
    };
  } | null;
};

export type NfcRecommendationsQueryVariables = Exact<{
  data: NfcFeedInput;
}>;

export type NfcRecommendationsQuery = {
  __typename?: "Query";
  getNFCFeed?: Array<{
    __typename?: "NFC";
    createdAt: any;
    id: string;
    videoLink?: string | null;
    videoThumbnail?: string | null;
    openseaLink?: string | null;
    score: number;
    liked?: boolean | null;
    title?: string | null;
    owner: {
      __typename?: "User";
      username?: string | null;
      address: string;
      FCImageUrl?: string | null;
      powerUserLvl: number;
      videoSavantLvl: number;
    };
  } | null> | null;
};

export type FetchAuthMessageQueryVariables = Exact<{ [key: string]: never }>;

export type FetchAuthMessageQuery = {
  __typename?: "Query";
  currentUserAuthMessage?: string | null;
};

export type FetchCurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type FetchCurrentUserQuery = {
  __typename?: "Query";
  currentUser?: {
    __typename?: "User";
    signature?: string | null;
    sigTimestamp?: any | null;
  } | null;
};

export const UseLike_HostEventFragmentDoc = gql`
  fragment useLike_hostEvent on HostEvent {
    id
    __typename
  }
`;
export const HostEventCard_HostEventFragmentDoc = gql`
  fragment HostEventCard_hostEvent on HostEvent {
    id
    hostDate
    title
    description
    score
    owner {
      username
      FCImageUrl
    }
    challenge {
      id
      hostDate
      title
      description
      score
      owner {
        username
        FCImageUrl
      }
      liked
      disliked
    }
    liked
    disliked
    ...useLike_hostEvent
  }
  ${UseLike_HostEventFragmentDoc}
`;
export const TaskCard_TaskFragmentDoc = gql`
  fragment TaskCard_task on Task {
    id
    taskType
    youtubeId
    title
    thumbnail
    description
    completed
    createdAt
    owner {
      username
      address
    }
  }
`;
export const VideoCard_VideoFragmentDoc = gql`
  fragment VideoCard_video on Video {
    id
    youtubeId
    title
    thumbnail
    description
    score
    duration
    createdAt
    owner {
      username
      address
    }
    liked
  }
`;
export const GetPoapDocument = gql`
  query GetPoap($data: GetPoapInput!) {
    getPoap(data: $data) {
      id
      link
    }
  }
`;

/**
 * __useGetPoapQuery__
 *
 * To run a query within a React component, call `useGetPoapQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPoapQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPoapQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetPoapQuery(
  baseOptions: Apollo.QueryHookOptions<GetPoapQuery, GetPoapQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPoapQuery, GetPoapQueryVariables>(
    GetPoapDocument,
    options
  );
}
export function useGetPoapLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetPoapQuery, GetPoapQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetPoapQuery, GetPoapQueryVariables>(
    GetPoapDocument,
    options
  );
}
export type GetPoapQueryHookResult = ReturnType<typeof useGetPoapQuery>;
export type GetPoapLazyQueryHookResult = ReturnType<typeof useGetPoapLazyQuery>;
export type GetPoapQueryResult = Apollo.QueryResult<
  GetPoapQuery,
  GetPoapQueryVariables
>;
export const TaskFeedDocument = gql`
  query TaskFeed($data: TaskFeedInput!) {
    getTaskFeed(data: $data) {
      id
      taskType
      youtubeId
      title
      thumbnail
      description
      link
      completed
      owner {
        username
        address
      }
    }
  }
`;

/**
 * __useTaskFeedQuery__
 *
 * To run a query within a React component, call `useTaskFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useTaskFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTaskFeedQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useTaskFeedQuery(
  baseOptions: Apollo.QueryHookOptions<TaskFeedQuery, TaskFeedQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<TaskFeedQuery, TaskFeedQueryVariables>(
    TaskFeedDocument,
    options
  );
}
export function useTaskFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    TaskFeedQuery,
    TaskFeedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<TaskFeedQuery, TaskFeedQueryVariables>(
    TaskFeedDocument,
    options
  );
}
export type TaskFeedQueryHookResult = ReturnType<typeof useTaskFeedQuery>;
export type TaskFeedLazyQueryHookResult = ReturnType<
  typeof useTaskFeedLazyQuery
>;
export type TaskFeedQueryResult = Apollo.QueryResult<
  TaskFeedQuery,
  TaskFeedQueryVariables
>;
export const CreateClipDocument = gql`
  mutation CreateClip($data: CreateClipInput!) {
    createClip(data: $data) {
      url
      thumbnail
      errorMessage
    }
  }
`;
export type CreateClipMutationFn = Apollo.MutationFunction<
  CreateClipMutation,
  CreateClipMutationVariables
>;

/**
 * __useCreateClipMutation__
 *
 * To run a mutation, you first call `useCreateClipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateClipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createClipMutation, { data, loading, error }] = useCreateClipMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateClipMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateClipMutation,
    CreateClipMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateClipMutation, CreateClipMutationVariables>(
    CreateClipDocument,
    options
  );
}
export type CreateClipMutationHookResult = ReturnType<
  typeof useCreateClipMutation
>;
export type CreateClipMutationResult =
  Apollo.MutationResult<CreateClipMutation>;
export type CreateClipMutationOptions = Apollo.BaseMutationOptions<
  CreateClipMutation,
  CreateClipMutationVariables
>;
export const LikeDocument = gql`
  mutation Like($data: HandleLikeInput!) {
    handleLike(data: $data) {
      id
      score
      liked
      disliked
    }
  }
`;
export type LikeMutationFn = Apollo.MutationFunction<
  LikeMutation,
  LikeMutationVariables
>;

/**
 * __useLikeMutation__
 *
 * To run a mutation, you first call `useLikeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLikeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [likeMutation, { data, loading, error }] = useLikeMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useLikeMutation(
  baseOptions?: Apollo.MutationHookOptions<LikeMutation, LikeMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LikeMutation, LikeMutationVariables>(
    LikeDocument,
    options
  );
}
export type LikeMutationHookResult = ReturnType<typeof useLikeMutation>;
export type LikeMutationResult = Apollo.MutationResult<LikeMutation>;
export type LikeMutationOptions = Apollo.BaseMutationOptions<
  LikeMutation,
  LikeMutationVariables
>;
export const PostFirstChatDocument = gql`
  mutation PostFirstChat($data: PostChatInput!) {
    postFirstChat(data: $data) {
      id
    }
  }
`;
export type PostFirstChatMutationFn = Apollo.MutationFunction<
  PostFirstChatMutation,
  PostFirstChatMutationVariables
>;

/**
 * __usePostFirstChatMutation__
 *
 * To run a mutation, you first call `usePostFirstChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostFirstChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postFirstChatMutation, { data, loading, error }] = usePostFirstChatMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostFirstChatMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostFirstChatMutation,
    PostFirstChatMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostFirstChatMutation,
    PostFirstChatMutationVariables
  >(PostFirstChatDocument, options);
}
export type PostFirstChatMutationHookResult = ReturnType<
  typeof usePostFirstChatMutation
>;
export type PostFirstChatMutationResult =
  Apollo.MutationResult<PostFirstChatMutation>;
export type PostFirstChatMutationOptions = Apollo.BaseMutationOptions<
  PostFirstChatMutation,
  PostFirstChatMutationVariables
>;
export const PostNfcDocument = gql`
  mutation PostNFC($data: PostNFCInput!) {
    postNFC(data: $data) {
      id
    }
  }
`;
export type PostNfcMutationFn = Apollo.MutationFunction<
  PostNfcMutation,
  PostNfcMutationVariables
>;

/**
 * __usePostNfcMutation__
 *
 * To run a mutation, you first call `usePostNfcMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostNfcMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postNfcMutation, { data, loading, error }] = usePostNfcMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostNfcMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostNfcMutation,
    PostNfcMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PostNfcMutation, PostNfcMutationVariables>(
    PostNfcDocument,
    options
  );
}
export type PostNfcMutationHookResult = ReturnType<typeof usePostNfcMutation>;
export type PostNfcMutationResult = Apollo.MutationResult<PostNfcMutation>;
export type PostNfcMutationOptions = Apollo.BaseMutationOptions<
  PostNfcMutation,
  PostNfcMutationVariables
>;
export const PostStreamInteractionDocument = gql`
  mutation PostStreamInteraction($data: PostStreamInteractionInput!) {
    postStreamInteraction(data: $data) {
      id
    }
  }
`;
export type PostStreamInteractionMutationFn = Apollo.MutationFunction<
  PostStreamInteractionMutation,
  PostStreamInteractionMutationVariables
>;

/**
 * __usePostStreamInteractionMutation__
 *
 * To run a mutation, you first call `usePostStreamInteractionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostStreamInteractionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postStreamInteractionMutation, { data, loading, error }] = usePostStreamInteractionMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostStreamInteractionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostStreamInteractionMutation,
    PostStreamInteractionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostStreamInteractionMutation,
    PostStreamInteractionMutationVariables
  >(PostStreamInteractionDocument, options);
}
export type PostStreamInteractionMutationHookResult = ReturnType<
  typeof usePostStreamInteractionMutation
>;
export type PostStreamInteractionMutationResult =
  Apollo.MutationResult<PostStreamInteractionMutation>;
export type PostStreamInteractionMutationOptions = Apollo.BaseMutationOptions<
  PostStreamInteractionMutation,
  PostStreamInteractionMutationVariables
>;
export const PostTaskDocument = gql`
  mutation PostTask($data: PostTaskInput!) {
    postTask(data: $data) {
      id
    }
  }
`;
export type PostTaskMutationFn = Apollo.MutationFunction<
  PostTaskMutation,
  PostTaskMutationVariables
>;

/**
 * __usePostTaskMutation__
 *
 * To run a mutation, you first call `usePostTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postTaskMutation, { data, loading, error }] = usePostTaskMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostTaskMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostTaskMutation,
    PostTaskMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PostTaskMutation, PostTaskMutationVariables>(
    PostTaskDocument,
    options
  );
}
export type PostTaskMutationHookResult = ReturnType<typeof usePostTaskMutation>;
export type PostTaskMutationResult = Apollo.MutationResult<PostTaskMutation>;
export type PostTaskMutationOptions = Apollo.BaseMutationOptions<
  PostTaskMutation,
  PostTaskMutationVariables
>;
export const PostVideoDocument = gql`
  mutation PostVideo($data: PostVideoInput!) {
    postVideo(data: $data) {
      id
    }
  }
`;
export type PostVideoMutationFn = Apollo.MutationFunction<
  PostVideoMutation,
  PostVideoMutationVariables
>;

/**
 * __usePostVideoMutation__
 *
 * To run a mutation, you first call `usePostVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postVideoMutation, { data, loading, error }] = usePostVideoMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostVideoMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostVideoMutation,
    PostVideoMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PostVideoMutation, PostVideoMutationVariables>(
    PostVideoDocument,
    options
  );
}
export type PostVideoMutationHookResult = ReturnType<
  typeof usePostVideoMutation
>;
export type PostVideoMutationResult = Apollo.MutationResult<PostVideoMutation>;
export type PostVideoMutationOptions = Apollo.BaseMutationOptions<
  PostVideoMutation,
  PostVideoMutationVariables
>;
export const UpdateUserNotificationsDocument = gql`
  mutation updateUserNotifications($data: UpdateUserNotificationsInput!) {
    updateUserNotifications(data: $data) {
      notificationsTokens
      notificationsLive
      notificationsNFCs
    }
  }
`;
export type UpdateUserNotificationsMutationFn = Apollo.MutationFunction<
  UpdateUserNotificationsMutation,
  UpdateUserNotificationsMutationVariables
>;

/**
 * __useUpdateUserNotificationsMutation__
 *
 * To run a mutation, you first call `useUpdateUserNotificationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserNotificationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserNotificationsMutation, { data, loading, error }] = useUpdateUserNotificationsMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateUserNotificationsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserNotificationsMutation,
    UpdateUserNotificationsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserNotificationsMutation,
    UpdateUserNotificationsMutationVariables
  >(UpdateUserNotificationsDocument, options);
}
export type UpdateUserNotificationsMutationHookResult = ReturnType<
  typeof useUpdateUserNotificationsMutation
>;
export type UpdateUserNotificationsMutationResult =
  Apollo.MutationResult<UpdateUserNotificationsMutation>;
export type UpdateUserNotificationsMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserNotificationsMutation,
  UpdateUserNotificationsMutationVariables
>;
export const GetUserDocument = gql`
  query getUser($data: GetUserInput!) {
    getUser(data: $data) {
      address
      username
      signature
      bio
      powerUserLvl
      videoSavantLvl
      nfcRank
      FCImageUrl
      isFCUser
      isLensUser
      lensHandle
      lensImageUrl
    }
  }
`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetUserQuery(
  baseOptions: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export function useGetUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserQueryResult = Apollo.QueryResult<
  GetUserQuery,
  GetUserQueryVariables
>;
export const VideoFeed1808Document = gql`
  query VideoFeed1808($data: VideoFeedInput!) {
    getVideoFeed(data: $data) {
      id
      title
      thumbnail
      description
      score
      createdAt
      owner {
        username
        address
      }
      liked
      skipped
    }
  }
`;

/**
 * __useVideoFeed1808Query__
 *
 * To run a query within a React component, call `useVideoFeed1808Query` and pass it any options that fit your needs.
 * When your component renders, `useVideoFeed1808Query` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVideoFeed1808Query({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useVideoFeed1808Query(
  baseOptions: Apollo.QueryHookOptions<
    VideoFeed1808Query,
    VideoFeed1808QueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<VideoFeed1808Query, VideoFeed1808QueryVariables>(
    VideoFeed1808Document,
    options
  );
}
export function useVideoFeed1808LazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    VideoFeed1808Query,
    VideoFeed1808QueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<VideoFeed1808Query, VideoFeed1808QueryVariables>(
    VideoFeed1808Document,
    options
  );
}
export type VideoFeed1808QueryHookResult = ReturnType<
  typeof useVideoFeed1808Query
>;
export type VideoFeed1808LazyQueryHookResult = ReturnType<
  typeof useVideoFeed1808LazyQuery
>;
export type VideoFeed1808QueryResult = Apollo.QueryResult<
  VideoFeed1808Query,
  VideoFeed1808QueryVariables
>;
export const ChannelDetailDocument = gql`
  query ChannelDetail($slug: String!) {
    getChannelBySlug(slug: $slug) {
      awsId
      channelArn
      description
      id
      name
      slug
      owner {
        FCImageUrl
        lensImageUrl
        username
      }
      playbackUrl
    }
  }
`;

/**
 * __useChannelDetailQuery__
 *
 * To run a query within a React component, call `useChannelDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useChannelDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChannelDetailQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useChannelDetailQuery(
  baseOptions: Apollo.QueryHookOptions<
    ChannelDetailQuery,
    ChannelDetailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ChannelDetailQuery, ChannelDetailQueryVariables>(
    ChannelDetailDocument,
    options
  );
}
export function useChannelDetailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ChannelDetailQuery,
    ChannelDetailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ChannelDetailQuery, ChannelDetailQueryVariables>(
    ChannelDetailDocument,
    options
  );
}
export type ChannelDetailQueryHookResult = ReturnType<
  typeof useChannelDetailQuery
>;
export type ChannelDetailLazyQueryHookResult = ReturnType<
  typeof useChannelDetailLazyQuery
>;
export type ChannelDetailQueryResult = Apollo.QueryResult<
  ChannelDetailQuery,
  ChannelDetailQueryVariables
>;
export const HostEventFeedDocument = gql`
  query HostEventFeed($data: HostEventFeedInput!) {
    getHostEventFeed(data: $data) {
      id
      hostDate
      title
      description
      score
      owner {
        username
        FCImageUrl
      }
      liked
      disliked
      challenge {
        id
        hostDate
        title
        description
        score
        owner {
          username
          FCImageUrl
        }
        liked
        disliked
      }
    }
  }
`;

/**
 * __useHostEventFeedQuery__
 *
 * To run a query within a React component, call `useHostEventFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useHostEventFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHostEventFeedQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useHostEventFeedQuery(
  baseOptions: Apollo.QueryHookOptions<
    HostEventFeedQuery,
    HostEventFeedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HostEventFeedQuery, HostEventFeedQueryVariables>(
    HostEventFeedDocument,
    options
  );
}
export function useHostEventFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HostEventFeedQuery,
    HostEventFeedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HostEventFeedQuery, HostEventFeedQueryVariables>(
    HostEventFeedDocument,
    options
  );
}
export type HostEventFeedQueryHookResult = ReturnType<
  typeof useHostEventFeedQuery
>;
export type HostEventFeedLazyQueryHookResult = ReturnType<
  typeof useHostEventFeedLazyQuery
>;
export type HostEventFeedQueryResult = Apollo.QueryResult<
  HostEventFeedQuery,
  HostEventFeedQueryVariables
>;
export const NfcFeedDocument = gql`
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

/**
 * __useNfcFeedQuery__
 *
 * To run a query within a React component, call `useNfcFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useNfcFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNfcFeedQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useNfcFeedQuery(
  baseOptions: Apollo.QueryHookOptions<NfcFeedQuery, NfcFeedQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<NfcFeedQuery, NfcFeedQueryVariables>(
    NfcFeedDocument,
    options
  );
}
export function useNfcFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<NfcFeedQuery, NfcFeedQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<NfcFeedQuery, NfcFeedQueryVariables>(
    NfcFeedDocument,
    options
  );
}
export type NfcFeedQueryHookResult = ReturnType<typeof useNfcFeedQuery>;
export type NfcFeedLazyQueryHookResult = ReturnType<typeof useNfcFeedLazyQuery>;
export type NfcFeedQueryResult = Apollo.QueryResult<
  NfcFeedQuery,
  NfcFeedQueryVariables
>;
export const GetAllUsersDocument = gql`
  query GetAllUsers {
    getAllUsers {
      username
      address
      notificationsTokens
      notificationsLive
      notificationsNFCs
    }
  }
`;

/**
 * __useGetAllUsersQuery__
 *
 * To run a query within a React component, call `useGetAllUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetAllUsersQuery,
    GetAllUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(
    GetAllUsersDocument,
    options
  );
}
export function useGetAllUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAllUsersQuery,
    GetAllUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(
    GetAllUsersDocument,
    options
  );
}
export type GetAllUsersQueryHookResult = ReturnType<typeof useGetAllUsersQuery>;
export type GetAllUsersLazyQueryHookResult = ReturnType<
  typeof useGetAllUsersLazyQuery
>;
export type GetAllUsersQueryResult = Apollo.QueryResult<
  GetAllUsersQuery,
  GetAllUsersQueryVariables
>;
export const NfcDetailDocument = gql`
  query NFCDetail($id: ID!) {
    getNFC(id: $id) {
      id
      title
      videoLink
      openseaLink
      videoThumbnail
      score
      liked
      updatedAt
      owner {
        address
        FCImageUrl
        username
      }
    }
  }
`;

/**
 * __useNfcDetailQuery__
 *
 * To run a query within a React component, call `useNfcDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useNfcDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNfcDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useNfcDetailQuery(
  baseOptions: Apollo.QueryHookOptions<NfcDetailQuery, NfcDetailQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<NfcDetailQuery, NfcDetailQueryVariables>(
    NfcDetailDocument,
    options
  );
}
export function useNfcDetailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NfcDetailQuery,
    NfcDetailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<NfcDetailQuery, NfcDetailQueryVariables>(
    NfcDetailDocument,
    options
  );
}
export type NfcDetailQueryHookResult = ReturnType<typeof useNfcDetailQuery>;
export type NfcDetailLazyQueryHookResult = ReturnType<
  typeof useNfcDetailLazyQuery
>;
export type NfcDetailQueryResult = Apollo.QueryResult<
  NfcDetailQuery,
  NfcDetailQueryVariables
>;
export const NfcRecommendationsDocument = gql`
  query NFCRecommendations($data: NFCFeedInput!) {
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

/**
 * __useNfcRecommendationsQuery__
 *
 * To run a query within a React component, call `useNfcRecommendationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNfcRecommendationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNfcRecommendationsQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useNfcRecommendationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    NfcRecommendationsQuery,
    NfcRecommendationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    NfcRecommendationsQuery,
    NfcRecommendationsQueryVariables
  >(NfcRecommendationsDocument, options);
}
export function useNfcRecommendationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NfcRecommendationsQuery,
    NfcRecommendationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    NfcRecommendationsQuery,
    NfcRecommendationsQueryVariables
  >(NfcRecommendationsDocument, options);
}
export type NfcRecommendationsQueryHookResult = ReturnType<
  typeof useNfcRecommendationsQuery
>;
export type NfcRecommendationsLazyQueryHookResult = ReturnType<
  typeof useNfcRecommendationsLazyQuery
>;
export type NfcRecommendationsQueryResult = Apollo.QueryResult<
  NfcRecommendationsQuery,
  NfcRecommendationsQueryVariables
>;
export const FetchAuthMessageDocument = gql`
  query FetchAuthMessage {
    currentUserAuthMessage
  }
`;

/**
 * __useFetchAuthMessageQuery__
 *
 * To run a query within a React component, call `useFetchAuthMessageQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchAuthMessageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchAuthMessageQuery({
 *   variables: {
 *   },
 * });
 */
export function useFetchAuthMessageQuery(
  baseOptions?: Apollo.QueryHookOptions<
    FetchAuthMessageQuery,
    FetchAuthMessageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FetchAuthMessageQuery, FetchAuthMessageQueryVariables>(
    FetchAuthMessageDocument,
    options
  );
}
export function useFetchAuthMessageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FetchAuthMessageQuery,
    FetchAuthMessageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    FetchAuthMessageQuery,
    FetchAuthMessageQueryVariables
  >(FetchAuthMessageDocument, options);
}
export type FetchAuthMessageQueryHookResult = ReturnType<
  typeof useFetchAuthMessageQuery
>;
export type FetchAuthMessageLazyQueryHookResult = ReturnType<
  typeof useFetchAuthMessageLazyQuery
>;
export type FetchAuthMessageQueryResult = Apollo.QueryResult<
  FetchAuthMessageQuery,
  FetchAuthMessageQueryVariables
>;
export const FetchCurrentUserDocument = gql`
  query FetchCurrentUser {
    currentUser {
      signature
      sigTimestamp
    }
  }
`;

/**
 * __useFetchCurrentUserQuery__
 *
 * To run a query within a React component, call `useFetchCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useFetchCurrentUserQuery(
  baseOptions?: Apollo.QueryHookOptions<
    FetchCurrentUserQuery,
    FetchCurrentUserQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FetchCurrentUserQuery, FetchCurrentUserQueryVariables>(
    FetchCurrentUserDocument,
    options
  );
}
export function useFetchCurrentUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FetchCurrentUserQuery,
    FetchCurrentUserQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    FetchCurrentUserQuery,
    FetchCurrentUserQueryVariables
  >(FetchCurrentUserDocument, options);
}
export type FetchCurrentUserQueryHookResult = ReturnType<
  typeof useFetchCurrentUserQuery
>;
export type FetchCurrentUserLazyQueryHookResult = ReturnType<
  typeof useFetchCurrentUserLazyQuery
>;
export type FetchCurrentUserQueryResult = Apollo.QueryResult<
  FetchCurrentUserQuery,
  FetchCurrentUserQueryVariables
>;
