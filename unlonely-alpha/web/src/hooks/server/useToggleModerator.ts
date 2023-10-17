import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  ToggleModeratorToChannelMutation,
  ToggleModeratorToChannelMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const TOGGLE_MODERATOR_TO_CHANNEL_MUTATION = gql`
  mutation toggleModeratorToChannel($data: ToggleUserAddressToChannelInput!) {
    toggleModeratorToChannel(data: $data) {
      id
    }
  }
`;

const useToggleModeratorToChannel = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    ToggleModeratorToChannelMutation,
    ToggleModeratorToChannelMutationVariables
  >(TOGGLE_MODERATOR_TO_CHANNEL_MUTATION);

  const toggleModeratorToChannel = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              channelId: data.channelId,
              userAddress: data.userAddress,
            },
          },
        });

        const res = mutationResult?.data?.toggleModeratorToChannel;
        /* eslint-disable no-console */
        if (res) {
          console.log("toggleModerator success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("toggleModerator", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { toggleModeratorToChannel, loading };
};

export default useToggleModeratorToChannel;
