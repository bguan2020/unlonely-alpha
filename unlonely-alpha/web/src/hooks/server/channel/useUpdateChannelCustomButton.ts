import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";
import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  UpdateChannelCustomButtonMutation,
  UpdateChannelCustomButtonMutationVariables,
} from "../../../generated/graphql";

const UPDATE_CHANNEL_CUSTOM_BUTTON_MUTATION = gql`
  mutation UpdateChannelCustomButton($data: UpdateChannelCustomButtonInput!) {
    updateChannelCustomButton(data: $data) {
      customButtonAction
      customButtonPrice
      id
    }
  }
`;

const useUpdateChannelCustomButton = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateChannelCustomButtonMutation,
    UpdateChannelCustomButtonMutationVariables
  >(UPDATE_CHANNEL_CUSTOM_BUTTON_MUTATION);

  const updateChannelCustomButton = useCallback(
    async (data) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateChannelCustomButton
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateChannelCustomButton, loading };
};

export default useUpdateChannelCustomButton;
