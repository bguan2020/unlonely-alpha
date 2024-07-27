import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import { useAuthedMutation } from "../../../apiClient/hooks";
import { UpdateUserChannelContract1155MappingInput, UpdateUserChannelContract1155MappingMutation, UpdateUserChannelContract1155MappingMutationVariables } from "../../../generated/graphql";

const UPDATE_CHANNEL_CONTRACT1155_MUTATION = gql`
  mutation UpdateUserChannelContract1155Mapping($data: UpdateUserChannelContract1155MappingInput!) {
    updateUserChannelContract1155Mapping(data: $data) {
      address
      username
      channelContract1155Mapping
    }
  }
`;

const useUpdateUserChannelContract1155Mapping = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<UpdateUserChannelContract1155MappingMutation, UpdateUserChannelContract1155MappingMutationVariables
  >(UPDATE_CHANNEL_CONTRACT1155_MUTATION);

  const updateUserChannelContract1155Mapping = useCallback(
    async (data: UpdateUserChannelContract1155MappingInput) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateUserChannelContract1155Mapping
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateUserChannelContract1155Mapping, loading };
};

export default useUpdateUserChannelContract1155Mapping;
