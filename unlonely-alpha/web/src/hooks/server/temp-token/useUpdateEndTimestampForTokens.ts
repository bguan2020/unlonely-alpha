import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  UpdateEndTimestampForTokensMutation,
  UpdateEndTimestampForTokensMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
  mutation UpdateEndTimestampForTokens(
    $data: UpdateEndTimestampForTokensInput!
  ) {
    updateEndTimestampForTokens(data: $data) {
      tokenAddress
      endUnixTimestamp
      channelId
      chainId
    }
  }
`;

const useUpdateEndTimestampForTokens = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateEndTimestampForTokensMutation,
    UpdateEndTimestampForTokensMutationVariables
  >(MUTATION);

  const updateEndTimestampForTokens = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              tokenAddresses: data.tokenAddresses as string[],
              chainId: data.chainId as number,
              additionalDurationInSeconds:
                data.additionalDurationInSeconds as number,
            },
          },
        });

        const res = mutationResult?.data?.updateEndTimestampForTokens;
        if (res) {
          console.log("updateEndTimestampForTokens success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateEndTimestampForTokens", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateEndTimestampForTokens, loading };
};

export default useUpdateEndTimestampForTokens;
