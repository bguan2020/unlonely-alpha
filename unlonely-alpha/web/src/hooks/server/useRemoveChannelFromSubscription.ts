import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  RemoveChannelFromSubscriptionMutation,
  RemoveChannelFromSubscriptionMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const REMOVE_CHANNEL_FROM_SUBSCRIPTION_MUTATION = gql`
  mutation RemoveChannelFromSubscription(
    $data: MoveChannelAlongSubscriptionInput!
  ) {
    removeChannelFromSubscription(data: $data) {
      id
    }
  }
`;

const useRemoveChannelFromSubscription = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    RemoveChannelFromSubscriptionMutation,
    RemoveChannelFromSubscriptionMutationVariables
  >(REMOVE_CHANNEL_FROM_SUBSCRIPTION_MUTATION);

  const removeChannelFromSubscription = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              endpoint: data.endpoint,
              channelId: data.channelId,
            },
          },
        });

        const res = mutationResult?.data?.removeChannelFromSubscription;
        /* eslint-disable no-console */
        if (res) {
          console.log("success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log(
          "removeChannelFromSubscription",
          JSON.stringify(e, null, 2)
        );
      }
    },
    [mutate, onError]
  );

  return { removeChannelFromSubscription, loading };
};

export default useRemoveChannelFromSubscription;
