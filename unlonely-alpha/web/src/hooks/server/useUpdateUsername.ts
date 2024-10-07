import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  UpdateUsernameMutation,
  UpdateUsernameMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
  mutation UpdateUsername($data: UpdateUsernameInput!) {
    updateUsername(data: $data) {
      username
      address
    }
  }
`;

const useUpdateUsername = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateUsernameMutation,
    UpdateUsernameMutationVariables
  >(MUTATION);

  const updateUsername = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data,
          },
        });

        const res = mutationResult?.data?.updateUsername;

        if (res) {
          console.log("updateUsername success:", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateUsername error", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateUsername, loading };
};

export default useUpdateUsername;
