import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  UpdateSharesEventMutation,
  UpdateSharesEventMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const UPDATE_SHARES_EVENT_MUTATION = gql`
  mutation UpdateSharesEvent($data: UpdateSharesEventInput!) {
    updateSharesEvent(data: $data) {
      id
    }
  }
`;

const useUpdateSharesEvent = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateSharesEventMutation,
    UpdateSharesEventMutationVariables
  >(UPDATE_SHARES_EVENT_MUTATION);

  const updateSharesEvent = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              id: data.id,
              sharesSubjectQuestion: data.sharesSubjectQuestion,
              sharesSubjectAddress: data.sharesSubjectAddress,
              eventState: data.eventState,
            },
          },
        });

        const res = mutationResult?.data?.updateSharesEvent;

        if (res) {
          console.log("updateSharesEvent success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateSharesEvent", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateSharesEvent, loading };
};

export default useUpdateSharesEvent;
