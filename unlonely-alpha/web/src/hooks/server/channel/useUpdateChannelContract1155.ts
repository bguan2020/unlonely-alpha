import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import {
  UpdateChannelContract1155Input,
  UpdateChannelContract1155Mutation,
  UpdateChannelContract1155MutationVariables,
} from "../../../generated/graphql";
import { useAuthedMutation } from "../../../apiClient/hooks";

const UPDATE_CHANNEL_CONTRACT1155_MUTATION = gql`
  mutation UpdateChannelContract1155($data: UpdateChannelContract1155Input!) {
    updateChannelContract1155(data: $data) {
      id
      contract1155Address
      contract1155ChainId
    }
  }
`;

const useUpdateChannelContract1155 = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateChannelContract1155Mutation,
    UpdateChannelContract1155MutationVariables
  >(UPDATE_CHANNEL_CONTRACT1155_MUTATION);

  const updateChannelContract1155 = useCallback(
    async (data: UpdateChannelContract1155Input) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateChannelContract1155
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateChannelContract1155, loading };
};

export default useUpdateChannelContract1155;
