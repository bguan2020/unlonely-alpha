import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  PostBetTradeMutation,
  PostBetTradeMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_BET_TRADE_MUTATION = gql`
  mutation PostBetTrade($data: PostBetTradeInput!) {
    postBetTrade(data: $data) {
      id
    }
  }
`;

const usePostBetTrade = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostBetTradeMutation,
    PostBetTradeMutationVariables
  >(POST_BET_TRADE_MUTATION);

  const postBetTrade = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              channelId: data.channelId,
              userAddress: data.userAddress,
              type: data.type,
              fees: data.fees,
              eventId: data.eventId,
              eventType: data.eventType,
              chainId: data.chainId,
            },
          },
        });

        const res = mutationResult?.data?.postBetTrade;
        if (res) {
          console.log("postBetTrade success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("postBetTrade error", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postBetTrade, loading };
};

export default usePostBetTrade;
