import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import { UpdateChannelClippingMutation, UpdateChannelClippingMutationVariables } from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
mutation UpdateChannelClipping($data: UpdateChannelClippingInput!) {
    updateChannelClipping(data: $data) {
      allowNFCs
      id
    }
  }
`;

const useUpdateChannelClipping = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<UpdateChannelClippingMutation, UpdateChannelClippingMutationVariables>(MUTATION);

  const updateChannelClipping = useCallback(
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

        const res = mutationResult?.data?.updateChannelClipping;

        if (res) {
          console.log("updateChannelClipping success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateChannelClipping", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateChannelClipping, loading };
};

export default useUpdateChannelClipping;
