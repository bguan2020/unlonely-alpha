import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  PostUserRoleForChannelMutation,
  PostUserRoleForChannelMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const SET_USER_ROLE_FOR_CHANNEL_MUTATION = gql`
  mutation PostUserRoleForChannel($data: PostUserRoleForChannelInput!) {
    postUserRoleForChannel(data: $data) {
      id
      channelId
      userAddress
      role
    }
  }
`;

const usePostUserRoleForChannel = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostUserRoleForChannelMutation,
    PostUserRoleForChannelMutationVariables
  >(SET_USER_ROLE_FOR_CHANNEL_MUTATION);

  const postUserRoleForChannel = useCallback(
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

        const res = mutationResult?.data?.postUserRoleForChannel;
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
        console.log("postUserRoleForChannel", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postUserRoleForChannel, loading };
};

export default usePostUserRoleForChannel;
