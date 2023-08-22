import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  PostSubscriptionMutation,
  PostSubscriptionMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_SUBSCRIPTION_MUTATION = gql`
  mutation PostSubscription($data: PostSubscriptionInput!) {
    postSubscription(data: $data) {
      id
    }
  }
`;

const usePostSubscription = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostSubscriptionMutation,
    PostSubscriptionMutationVariables
  >(POST_SUBSCRIPTION_MUTATION);

  const postSubscription = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              endpoint: data.endpoint,
              expirationTime: data.expirationTime,
              p256dh: data.p256dh,
              auth: data.auth,
            },
          },
        });

        const res = mutationResult?.data?.postSubscription;
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
        console.log("postSubscription", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postSubscription, loading };
};

export default usePostSubscription;
