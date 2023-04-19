import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import {
  UpdateChannelTextMutation,
  UpdateChannelTextMutationVariables,
} from "../generated/graphql";
import { useAuthedMutation } from "../apiClient/hooks";

const UPDATE_CHANNEL_TEXT_MUTATION = gql`
  mutation UpdateChannelText($data: UpdateChannelTextInput!) {
    updateChannelText(data: $data) {
      id
      name
      description
    }
  }
`;

const useUpdateChannelText = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateChannelTextMutation,
    UpdateChannelTextMutationVariables
  >(UPDATE_CHANNEL_TEXT_MUTATION);

  const updateChannelText = useCallback(
    async (data) => {
      setLoading(true);
      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateChannelText
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateChannelText, loading };
};

export default useUpdateChannelText;
