import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  PostBaseLeaderboardMutation,
  PostBaseLeaderboardMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_BASELEADERBOARD_MUTATION = gql`
  mutation PostBaseLeaderboard($data: PostBaseLeaderboardInput!) {
    postBaseLeaderboard(data: $data) {
      id
    }
  }
`;

const usePostBaseLeaderboard = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostBaseLeaderboardMutation,
    PostBaseLeaderboardMutationVariables
  >(POST_BASELEADERBOARD_MUTATION);

  const postBaseLeaderboard = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              amount: Number(data.amount),
              userAddress: data.userAddress,
            },
          },
        });

        const res = mutationResult?.data?.postBaseLeaderboard;
        /* eslint-disable no-console */
        if (res) {
          console.log("postBaseLeaderboard success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("postBaseLeaderboard", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postBaseLeaderboard, loading };
};

export default usePostBaseLeaderboard;
