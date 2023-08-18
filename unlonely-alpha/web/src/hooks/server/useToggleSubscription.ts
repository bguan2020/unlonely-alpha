import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  ToggleSubscriptionMutation,
  ToggleSubscriptionMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const TOGGLE_SUBSCRIPTION_MUTATION = gql`
  mutation ToggleSubscription($data: ToggleSubscriptionInput!) {
    toggleSubscription(data: $data) {
      id
    }
  }
`;

const useToggleSubscription = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<ToggleSubscriptionMutation, ToggleSubscriptionMutationVariables>(
    TOGGLE_SUBSCRIPTION_MUTATION
  );

  const toggleSubscription = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              endpoint: data.endpoint,
            },
          },
        });

        const res = mutationResult?.data?.toggleSubscription;
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
        console.log("toggleSubscription", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { toggleSubscription, loading };
};

export default useToggleSubscription;
