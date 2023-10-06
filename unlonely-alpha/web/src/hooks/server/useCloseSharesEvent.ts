import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  CloseSharesEventMutation,
  CloseSharesEventMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const CLOSE_SHARES_EVENT_MUTATION = gql`
  mutation CloseSharesEvent($data: PostCloseSharesEventInput!) {
    closeSharesEvent(data: $data) {
      id
    }
  }
`;

const useCloseSharesEvent = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    CloseSharesEventMutation,
    CloseSharesEventMutationVariables
  >(CLOSE_SHARES_EVENT_MUTATION);

  const closeSharesEvent = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              id: data.id,
            },
          },
        });

        const res = mutationResult?.data?.closeSharesEvent;

        if (res) {
          console.log("closeSharesEvent success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("closeSharesEvent", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { closeSharesEvent, loading };
};

export default useCloseSharesEvent;
