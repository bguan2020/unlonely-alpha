import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  CloseSharesEventsMutation,
  CloseSharesEventsMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const CLOSE_SHARES_EVENTS_MUTATION = gql`
  mutation CloseSharesEvents($data: PostCloseSharesEventsInput!) {
    closeSharesEvents(data: $data) {
      count
    }
  }
`;

const useCloseSharesEvents = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    CloseSharesEventsMutation,
    CloseSharesEventsMutationVariables
  >(CLOSE_SHARES_EVENTS_MUTATION);

  const closeSharesEvents = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              chainId: data.chainId,
              channelId: data.channelId,
              sharesEventIds: data.sharesEventIds,
            },
          },
        });

        const res = mutationResult?.data?.closeSharesEvents;

        if (res) {
          console.log("closeSharesEvents success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("closeSharesEvents", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { closeSharesEvents, loading };
};

export default useCloseSharesEvents;
