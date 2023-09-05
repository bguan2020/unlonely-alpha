import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  AddChannelToSubscriptionMutation,
  AddChannelToSubscriptionMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const ADD_CHANNEL_TO_SUBSCRIPTION_MUTATION = gql`
  mutation AddChannelToSubscription($data: MoveChannelAlongSubscriptionInput!) {
    addChannelToSubscription(data: $data) {
      id
    }
  }
`;

const useAddChannelToSubscription = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    AddChannelToSubscriptionMutation,
    AddChannelToSubscriptionMutationVariables
  >(ADD_CHANNEL_TO_SUBSCRIPTION_MUTATION);

  const addChannelToSubscription = useCallback(
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

        const res = mutationResult?.data?.addChannelToSubscription;
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
        console.log("addChannelToSubscription", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { addChannelToSubscription, loading };
};

export default useAddChannelToSubscription;
