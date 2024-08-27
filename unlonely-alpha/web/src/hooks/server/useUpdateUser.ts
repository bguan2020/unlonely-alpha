import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($data: UpdateUserInput!) {
    updateUser(data: $data) {
      error
      rawDataString
      newSocialDataString
      newUserData {
        username
        address
        FCHandle
        lensHandle
      }
    }
  }
`;

const useUpdateUser = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >(UPDATE_USER_MUTATION);

  const updateUser = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data,
          },
        });

        const res = mutationResult?.data?.updateUser;

        if (res) {
          console.log("updateUser success:", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateUser error", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateUser, loading };
};

export default useUpdateUser;
