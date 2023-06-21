import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  UpdateUserNotificationsMutation,
  UpdateUserNotificationsMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};
const UPDATE_USER_NOTIFICATIONS_MUTATION = gql`
  mutation updateUserNotifications($data: UpdateUserNotificationsInput!) {
    updateUserNotifications(data: $data) {
      notificationsTokens
      notificationsLive
      notificationsNFCs
    }
  }
`;

const useUpdateUserNotifications = ({ onError }: Props) => {
  const [mutate] = useAuthedMutation<
    UpdateUserNotificationsMutation,
    UpdateUserNotificationsMutationVariables
  >(UPDATE_USER_NOTIFICATIONS_MUTATION);

  const updateUserNotifications = useCallback(
    async (data) => {
      const mutationResult = await mutate({
        variables: {
          data: {
            notificationsTokens: data.notificationsTokens,
            notificationsLive: data.notificationsLive,
            notificationsNFCs: data.notificationsNFCs,
          },
        },
      });

      const res = mutationResult?.data?.updateUserNotifications;
      /* eslint-disable no-console */
      if (res) {
        console.log("success");
      } else {
        onError && onError();
      }

      return {
        res,
      };
    },
    [mutate, onError]
  );

  return { updateUserNotifications };
};

export default useUpdateUserNotifications;
