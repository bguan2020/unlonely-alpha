import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  PostBadgeTradeMutation,
  PostBadgeTradeMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_BADGE_TRADE_MUTATION = gql`
  mutation PostBadgeTrade($data: PostBadgeTradeInput!) {
    postBadgeTrade(data: $data) {
      id
    }
  }
`;

const usePostBadgeTrade = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostBadgeTradeMutation,
    PostBadgeTradeMutationVariables
  >(POST_BADGE_TRADE_MUTATION);

  const postBadgeTrade = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              channelId: data.channelId,
              userAddress: data.userAddress,
              isBuying: data.isBuying,
            },
          },
        });

        const res = mutationResult?.data?.postBadgeTrade;
        if (res) {
          console.log("postBadgeTrade success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("postBadgeTrade error", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postBadgeTrade, loading };
};

export default usePostBadgeTrade;
