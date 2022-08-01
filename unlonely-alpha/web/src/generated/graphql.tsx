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
  postVideo?: Maybe<Video>;
};

export type MutationHandleLikeArgs = {
  data: HandleLikeInput;
};

export type MutationPostCommentArgs = {
  data: PostCommentInput;
};

export type MutationPostVideoArgs = {
  data: PostVideoInput;
};

export type PostCommentInput = {
  location_x: Scalars["Int"];
  location_y: Scalars["Int"];
  text: Scalars["String"];
  videoId: Scalars["Int"];
  videoTimestamp: Scalars["Float"];
};

export type PostVideoInput = {
  description?: InputMaybe<Scalars["String"]>;
  thumbnail?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
  youtubeId?: InputMaybe<Scalars["String"]>;
};

export type Query = {
  __typename?: "Query";
  _empty?: Maybe<Scalars["String"]>;
  currentUser?: Maybe<User>;
  currentUserAuthMessage?: Maybe<Scalars["String"]>;
  getLeaderboard?: Maybe<Array<Maybe<User>>>;
  getUser?: Maybe<User>;
  getVideo?: Maybe<Video>;
  getVideoFeed?: Maybe<Array<Maybe<Video>>>;
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

export type User = {
  __typename?: "User";
  address: Scalars["String"];
  authedAsMe: Scalars["Boolean"];
  bio?: Maybe<Scalars["String"]>;
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  reputation?: Maybe<Scalars["Int"]>;
  sigTimestamp?: Maybe<Scalars["BigInt"]>;
  signature?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
  username?: Maybe<Scalars["String"]>;
};

export type Video = Likable & {
  __typename?: "Video";
  comments: Array<Comment>;
  createdAt: Scalars["DateTime"];
  description: Scalars["String"];
  id: Scalars["ID"];
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

export type VideoCard_VideoFragment = {
  __typename: "Video";
  id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  description: string;
  score: number;
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

export type PostVideoMutationVariables = Exact<{
  data: PostVideoInput;
}>;

export type PostVideoMutation = {
  __typename?: "Mutation";
  postVideo?: { __typename?: "Video"; id: string } | null;
};

export type VideoFeedQueryVariables = Exact<{
  data: VideoFeedInput;
}>;

export type VideoFeedQuery = {
  __typename?: "Query";
  getVideoFeed?: Array<{
    __typename?: "Video";
    id: string;
    youtubeId: string;
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
export const VideoFeedDocument = gql`
  query VideoFeed($data: VideoFeedInput!) {
    getVideoFeed(data: $data) {
      id
      youtubeId
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
 * __useVideoFeedQuery__
 *
 * To run a query within a React component, call `useVideoFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useVideoFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVideoFeedQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useVideoFeedQuery(
  baseOptions: Apollo.QueryHookOptions<VideoFeedQuery, VideoFeedQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<VideoFeedQuery, VideoFeedQueryVariables>(
    VideoFeedDocument,
    options
  );
}
export function useVideoFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    VideoFeedQuery,
    VideoFeedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<VideoFeedQuery, VideoFeedQueryVariables>(
    VideoFeedDocument,
    options
  );
}
export type VideoFeedQueryHookResult = ReturnType<typeof useVideoFeedQuery>;
export type VideoFeedLazyQueryHookResult = ReturnType<
  typeof useVideoFeedLazyQuery
>;
export type VideoFeedQueryResult = Apollo.QueryResult<
  VideoFeedQuery,
  VideoFeedQueryVariables
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
