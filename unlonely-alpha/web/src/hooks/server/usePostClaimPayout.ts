import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  GamblableEvent,
  PostClaimPayoutMutation,
  PostClaimPayoutMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_CLAIM_PAYOUT_MUTATION = gql`
  mutation PostClaimPayout($data: PostClaimPayoutInput!) {
    postClaimPayout(data: $data) {
      id
    }
  }
`;

const usePostClaimPayout = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostClaimPayoutMutation,
    PostClaimPayoutMutationVariables
  >(POST_CLAIM_PAYOUT_MUTATION);

  const postClaimPayout = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              channelId: data.channelId,
              userAddress: data.userAddress,
              sharesEventId: data.sharesEventId,
              type: GamblableEvent.BetClaimPayout,
            },
          },
        });

        const res = mutationResult?.data?.postClaimPayout;

        if (res) {
          console.log("postClaimPayout success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("postClaimPayout", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postClaimPayout, loading };
};

export default usePostClaimPayout;
