import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  UpdateChannelAllowNfcsMutation,
  UpdateChannelAllowNfcsMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
  mutation UpdateChannelAllowNfcs($data: UpdateChannelAllowNfcsInput!) {
    updateChannelAllowNfcs(data: $data) {
      allowNFCs
      id
    }
  }
`;

const useUpdateChannelAllowNfcs = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateChannelAllowNfcsMutation,
    UpdateChannelAllowNfcsMutationVariables
  >(MUTATION);

  const updateChannelAllowNfcs = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              id: data.id,
              allowNfcs: data.allowNfcs,
            },
          },
        });

        const res = mutationResult?.data?.updateChannelAllowNfcs;

        if (res) {
          console.log("updateChannelAllowNfcs success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateChannelAllowNfcs", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateChannelAllowNfcs, loading };
};

export default useUpdateChannelAllowNfcs;
