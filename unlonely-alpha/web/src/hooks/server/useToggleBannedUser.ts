import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  ToggleBannedUserToChannelMutation,
  ToggleBannedUserToChannelMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const TOGGLE_BANNED_USER_TO_CHANNEL_MUTATION = gql`
  mutation toggleBannedUserToChannel($data: ToggleBannedUserToChannelInput!) {
    toggleBannedUserToChannel(data: $data) {
      id
    }
  }
`;

const useToggleBannedUserToChannel = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    ToggleBannedUserToChannelMutation,
    ToggleBannedUserToChannelMutationVariables
  >(TOGGLE_BANNED_USER_TO_CHANNEL_MUTATION);

  const toggleBannedUserToChannel = useCallback(
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

        const res = mutationResult?.data?.toggleBannedUserToChannel;
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
        console.log("toggleBannedUser", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { toggleBannedUserToChannel, loading };
};

export default useToggleBannedUserToChannel;
