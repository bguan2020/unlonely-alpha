import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  SetUserRoleForChannelMutation,
  SetUserRoleForChannelMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const SET_USER_ROLE_FOR_CHANNEL_MUTATION = gql`
  mutation setUserRoleForChannel($data: SetUserRoleForChannelInput!) {
    setUserRoleForChannel(data: $data) {
      id
      channelId
      userAddress
      role
    }
  }
`;

const useSetUserRoleForChannel = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    SetUserRoleForChannelMutation,
    SetUserRoleForChannelMutationVariables
  >(SET_USER_ROLE_FOR_CHANNEL_MUTATION);

  const setUserRoleForChannel = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              channelId: data.channelId,
              userAddress: data.userAddress,
              role: data.role,
            },
          },
        });

        const res = mutationResult?.data?.setUserRoleForChannel;
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
        console.log("setUserRoleForChannel", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { setUserRoleForChannel, loading };
};

export default useSetUserRoleForChannel;
