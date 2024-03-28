import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import { UpdateTempTokenHighestTotalSupplyMutation, UpdateTempTokenHighestTotalSupplyMutationVariables } from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
  mutation UpdateTempTokenHighestTotalSupply($data: UpdateTempTokenHighestTotalSupplyInput!) {
    updateTempTokenHighestTotalSupply(data: $data) {
      tokenAddress
      symbol
      ownerAddress
      name
      highestTotalSupply
      hasHitTotalSupplyThreshold
      channelId
      endUnixTimestamp
      chainId
    }
  }
`;

const useUpdateTempTokenHighestTotalSupply = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<UpdateTempTokenHighestTotalSupplyMutation, UpdateTempTokenHighestTotalSupplyMutationVariables>(
    MUTATION
  );

  const updateTempTokenHighestTotalSupply = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
                tokenAddresses: data.tokenAddresses as string[],
                chainId: data.chainId as number,
                newTotalSupplies: data.newTotalSupplies as string[],
            },
          },
        });

        const res = mutationResult?.data?.updateTempTokenHighestTotalSupply;
        if (res) {
          console.log("updateTempTokenHighestTotalSupply success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateTempTokenHighestTotalSupply", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateTempTokenHighestTotalSupply, loading };
};

export default useUpdateTempTokenHighestTotalSupply;
