import { gql } from "@apollo/client";

import { useAuthedMutation } from "../apiClient/hooks";
import {
  LikeMutation,
  LikeMutationVariables,
} from "../generated/graphql";

const LIKE_MUTATION = gql`
  mutation Like($data: HandleLikeInput!) {
    handleLike(data: $data) {
      id
      score
      liked
      disliked
    }
  }
`;

// props
interface UseLikeProps {
  powerLvl: number | undefined;
  id: string | undefined;
}

const useLike = ({ id, powerLvl }: UseLikeProps) => {
  const [mutate] = useAuthedMutation<LikeMutation, LikeMutationVariables>(
    LIKE_MUTATION
  );

  let value: number;
  // switch 
  switch (powerLvl) {
    case 0:
      value = 1;
      break;
    case 1:
      value = 2;
      break;
    case 2:
      value = 4;
      break;
    case 3:
      value = 6;
      break;
    default:
      value = 1;
      break;
  }

  if (id) {
    const like = () =>
      mutate({
        variables: { data: { hostEventId: id, value: value } },
      });
  
    const dislike = () =>
      mutate({
        variables: { data: { hostEventId: id, value: -value } },
      });
  
    return { like, dislike };
  }
  return { like: () => {}, dislike: () => {} };
};

useLike.fragments = {
  hostEvent: gql`
    fragment useLike_hostEvent on HostEvent {
      id
      __typename
    }
  `,
};

export default useLike;
