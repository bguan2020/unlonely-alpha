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

export type Chat = {
  __typename?: "Chat";
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  owner: User;
  text: Scalars["String"];
  updatedAt: Scalars["DateTime"];
};

export type Comment = {
  __typename?: "Comment";
  color: Scalars["String"];
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  liked?: Maybe<Scalars["Boolean"]>;
  location_x: Scalars["Int"];
  location_y: Scalars["Int"];
  owner: User;
  score: Scalars["Int"];
  text: Scalars["String"];
  updatedAt: Scalars["DateTime"];
  video: Video;
  videoId: Scalars["Int"];
  videoTimestamp: Scalars["Float"];
};

export type GetChatInput = {
  address?: InputMaybe<Scalars["String"]>;
};

export type GetPoapInput = {
  date: Scalars["String"];
};

export type GetUserInput = {
  address?: InputMaybe<Scalars["String"]>;
};

export type HandleLikeInput = {
  value: Scalars["Int"];
  videoId: Scalars["ID"];
};

export type Likable = {
  id: Scalars["ID"];
  liked?: Maybe<Scalars["Boolean"]>;
  score: Scalars["Int"];
  skipped?: Maybe<Scalars["Boolean"]>;
};

export type Like = {
  __typename?: "Like";
  id: Scalars["ID"];
  liked: Scalars["Boolean"];
  liker: User;
  skipped: Scalars["Boolean"];
  video?: Maybe<Video>;
};

export type Mutation = {
  __typename?: "Mutation";
  _empty?: Maybe<Scalars["String"]>;
  handleLike?: Maybe<Likable>;
  postComment?: Maybe<Comment>;
  postFirstChat?: Maybe<Chat>;
  postTask?: Maybe<Task>;
  postVideo?: Maybe<Video>;
  softDeleteTask?: Maybe<Scalars["Boolean"]>;
  softDeleteVideo?: Maybe<Scalars["Boolean"]>;
};

export type MutationHandleLikeArgs = {
  data: HandleLikeInput;
};

export type MutationPostCommentArgs = {
  data: PostCommentInput;
};

export type MutationPostFirstChatArgs = {
  data: PostChatInput;
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

export type PostChatInput = {
  text: Scalars["String"];
};

export type PostCommentInput = {
  location_x: Scalars["Int"];
  location_y: Scalars["Int"];
  text: Scalars["String"];
  videoId: Scalars["Int"];
  videoTimestamp: Scalars["Float"];
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
  currentUser?: Maybe<User>;
  currentUserAuthMessage?: Maybe<Scalars["String"]>;
  firstChatExists?: Maybe<Scalars["Boolean"]>;
  getLeaderboard?: Maybe<Array<Maybe<User>>>;
  getPoap?: Maybe<Poap>;
  getTaskFeed?: Maybe<Array<Maybe<Task>>>;
  getUser?: Maybe<User>;
  getVideo?: Maybe<Video>;
  getVideoFeed?: Maybe<Array<Maybe<Video>>>;
};

export type QueryGetPoapArgs = {
  data?: InputMaybe<GetPoapInput>;
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

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

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

export type User = {
  __typename?: "User";
  address: Scalars["String"];
  authedAsMe: Scalars["Boolean"];
  bio?: Maybe<Scalars["String"]>;
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  isFCUser: Scalars["Boolean"];
  powerUserLvl: Scalars["Int"];
  reputation?: Maybe<Scalars["Int"]>;
  sigTimestamp?: Maybe<Scalars["BigInt"]>;
  signature?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
  username?: Maybe<Scalars["String"]>;
  videoSavantLvl: Scalars["Int"];
};

export type Video = Likable & {
  __typename?: "Video";
  comments: Array<Comment>;
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

export type Comment_CommentFragment = {
  __typename?: "Comment";
  text: string;
  score: number;
  color: string;
  location_x: number;
  location_y: number;
  videoId: number;
  videoTimestamp: number;
  createdAt: any;
  owner: { __typename?: "User"; username?: string | null; address: string };
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

export type VideoCard_VideoFragment = {
  __typename: "Video";
  id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  description: string;
  score: number;
  duration: number;
  createdAt: any;
  liked?: boolean | null;
  skipped?: boolean | null;
  owner: { __typename?: "User"; username?: string | null; address: string };
};

export type LikeMutationVariables = Exact<{
  data: HandleLikeInput;
}>;

export type LikeMutation = {
  __typename?: "Mutation";
  handleLike?: {
    __typename?: "Video";
    id: string;
    score: number;
    liked?: boolean | null;
    skipped?: boolean | null;
  } | null;
};

export type UseLike_VideoFragment = { __typename: "Video"; id: string };

export type PostCommentMutationVariables = Exact<{
  data: PostCommentInput;
}>;

export type PostCommentMutation = {
  __typename?: "Mutation";
  postComment?: {
    __typename?: "Comment";
    video: {
      __typename?: "Video";
      id: string;
      youtubeId: string;
      comments: Array<{
        __typename?: "Comment";
        id: string;
        text: string;
        score: number;
        color: string;
        location_x: number;
        location_y: number;
        videoId: number;
        videoTimestamp: number;
        createdAt: any;
        owner: {
          __typename?: "User";
          username?: string | null;
          address: string;
        };
      }>;
    };
  } | null;
};

export type PostFirstChatMutationVariables = Exact<{
  data: PostChatInput;
}>;

export type PostFirstChatMutation = {
  __typename?: "Mutation";
  postFirstChat?: { __typename?: "Chat"; id: string } | null;
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

export const Comment_CommentFragmentDoc = gql`
  fragment Comment_comment on Comment {
    owner {
      username
      address
    }
    text
    score
    color
    location_x
    location_y
    videoId
    videoTimestamp
    createdAt
  }
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
export const UseLike_VideoFragmentDoc = gql`
  fragment useLike_video on Video {
    id
    __typename
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
    skipped
    ...useLike_video
  }
  ${UseLike_VideoFragmentDoc}
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
export const LikeDocument = gql`
  mutation Like($data: HandleLikeInput!) {
    handleLike(data: $data) {
      id
      score
      liked
      skipped
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
export const PostCommentDocument = gql`
  mutation PostComment($data: PostCommentInput!) {
    postComment(data: $data) {
      video {
        id
        youtubeId
        comments {
          id
          ...Comment_comment
        }
      }
    }
  }
  ${Comment_CommentFragmentDoc}
`;
export type PostCommentMutationFn = Apollo.MutationFunction<
  PostCommentMutation,
  PostCommentMutationVariables
>;

/**
 * __usePostCommentMutation__
 *
 * To run a mutation, you first call `usePostCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postCommentMutation, { data, loading, error }] = usePostCommentMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostCommentMutation,
    PostCommentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PostCommentMutation, PostCommentMutationVariables>(
    PostCommentDocument,
    options
  );
}
export type PostCommentMutationHookResult = ReturnType<
  typeof usePostCommentMutation
>;
export type PostCommentMutationResult =
  Apollo.MutationResult<PostCommentMutation>;
export type PostCommentMutationOptions = Apollo.BaseMutationOptions<
  PostCommentMutation,
  PostCommentMutationVariables
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
export const GetUserDocument = gql`
  query getUser($data: GetUserInput!) {
    getUser(data: $data) {
      address
      username
      signature
      bio
      powerUserLvl
      videoSavantLvl
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
