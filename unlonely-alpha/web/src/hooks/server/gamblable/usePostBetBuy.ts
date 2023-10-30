import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  PostBetBuyMutation,
  PostBetBuyMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_BET_BUY_MUTATION = gql`
  mutation PostBetBuy($data: PostBetBuyInput!) {
    postBetBuy(data: $data) {
      id
    }
  }
`;

const usePostBetBuy = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostBetBuyMutation,
    PostBetBuyMutationVariables
  >(POST_BET_BUY_MUTATION);

  const postBetBuy = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              channelId: data.channelId,
              userAddress: data.userAddress,
              isYay: data.isYay,
            },
          },
        });

        const res = mutationResult?.data?.postBetBuy;
        if (res) {
          console.log("postBetBuy success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("postBetBuy error", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postBetBuy, loading };
};

export default usePostBetBuy;
