import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const UPDATE_CHANNEL_FID_SUBSCRIPTION_MUTATION = gql`
  mutation UpdateChannelFidSubscription($data: UpdateChannelFidSubscriptionInput!) {
    updateChannelFidSubscription(data: $data) {
    }
  }
`;

const useUpdateChannelFidSubscription = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation(UPDATE_CHANNEL_FID_SUBSCRIPTION_MUTATION);

  const updateChannelFidSubscription = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              fid: data.fid,
              channelId: data.channelId,
              isAddingSubscriber: data.isAddingSubscriber,
            },
          },
        });

        const res = mutationResult?.data?.updateChannelFidSubscription;

        if (res) {
          console.log("updateChannelFidSubscription success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateChannelFidSubscription", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateChannelFidSubscription, loading };
};

export default useUpdateChannelFidSubscription;
