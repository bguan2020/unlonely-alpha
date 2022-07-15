import { gql } from "@apollo/client";

import { useAuthedMutation } from "../apiClient/hooks";
import {
  UseLike_VideoFragment,
  LikeMutation,
  LikeMutationVariables,
} from "../generated/graphql";

const LIKE_MUTATION = gql`
  mutation Like($data: HandleLikeInput!) {
    handleLike(data: $data) {
      id
      score
      liked
      skipped
    }
  }
`;

const useLike = ({ id }: UseLike_VideoFragment) => {
  const [mutate] = useAuthedMutation<LikeMutation, LikeMutationVariables>(
    LIKE_MUTATION
  );

  const like = () =>
    mutate({
      variables: { data: { videoId: id, value: 1 } },
    });

  const skip = () =>
    mutate({
      variables: { data: { videoId: id, value: -1 } },
    });

  return { like, skip };
};

useLike.fragments = {
  video: gql`
    fragment useLike_video on Video {
      id
      __typename
    }
  `,
};

export default useLike;
