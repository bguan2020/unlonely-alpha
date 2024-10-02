import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  UpdatePinnedChatMessagesInput,
  UpdatePinnedChatMessagesMutation,
  UpdatePinnedChatMessagesMutationVariables,
} from "../../../generated/graphql";

const MUTATION = gql`
  mutation UpdatePinnedChatMessages($data: UpdatePinnedChatMessagesInput!) {
    updatePinnedChatMessages(data: $data) {
      pinnedChatMessages
    }
  }
`;

const useUpdatePinnedChatMessages = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdatePinnedChatMessagesMutation,
    UpdatePinnedChatMessagesMutationVariables
  >(MUTATION);

  const updatePinnedChatMessages = useCallback(
    async (data: UpdatePinnedChatMessagesInput) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updatePinnedChatMessages
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updatePinnedChatMessages, loading };
};

export default useUpdatePinnedChatMessages;
