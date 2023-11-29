import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  PostBetMutation,
  PostBetMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_BET_MUTATION = gql`
  mutation PostBet($data: PostBetInput!) {
    postBet(data: $data) {
      id
    }
  }
`;

const usePostBet = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<PostBetMutation, PostBetMutationVariables>(
    POST_BET_MUTATION
  );

  const postBet = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              channelId: data.channelId,
              userAddress: data.userAddress,
              sharesEventId: data.sharesEventId,
            },
          },
        });

        const res = mutationResult?.data?.postBet;
        if (res) {
          console.log("postBet success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("postBet error", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postBet, loading };
};

export default usePostBet;
