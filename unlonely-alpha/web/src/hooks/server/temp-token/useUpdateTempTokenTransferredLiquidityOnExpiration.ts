import { gql } from "@apollo/client";

import { GraphQLErrors } from "@apollo/client/errors";

import {
  UpdateTempTokenTransferredLiquidityOnExpirationMutation,
  UpdateTempTokenTransferredLiquidityOnExpirationMutationVariables,
} from "../../../generated/graphql";
import { useState, useCallback } from "react";
import { useAuthedMutation } from "../../../apiClient/hooks";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
  mutation UpdateTempTokenTransferredLiquidityOnExpiration(
    $data: UpdateTempTokenTransferredLiquidityOnExpirationInput!
  ) {
    updateTempTokenTransferredLiquidityOnExpiration(data: $data) {
      transferredLiquidityOnExpiration
      tokenAddress
      symbol
      streamerFeePercentage
      protocolFeePercentage
      ownerAddress
      name
      isAlwaysTradeable
      id
      highestTotalSupply
      factoryAddress
      hasHitTotalSupplyThreshold
      hasRemainingFundsForCreator
      endUnixTimestamp
      creationBlockNumber
      chainId
      channelId
    }
  }
`;

const useUpdateTempTokenTransferredLiquidityOnExpiration = ({
  onError,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateTempTokenTransferredLiquidityOnExpirationMutation,
    UpdateTempTokenTransferredLiquidityOnExpirationMutationVariables
  >(MUTATION);

  const updateTempTokenTransferredLiquidityOnExpiration = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              losingTokenAddress: data.losingTokenAddress as string,
              chainId: data.chainId as number,
              finalLiquidityInWei: data.finalLiquidityInWei as string,
            },
          },
        });

        const res =
          mutationResult?.data?.updateTempTokenTransferredLiquidityOnExpiration;
        if (res) {
          console.log(
            "updateTempTokenTransferredLiquidityOnExpiration success",
            res
          );
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log(
          "updateTempTokenTransferredLiquidityOnExpiration",
          JSON.stringify(e, null, 2)
        );
      }
    },
    [mutate, onError]
  );

  return { updateTempTokenTransferredLiquidityOnExpiration, loading };
};

export default useUpdateTempTokenTransferredLiquidityOnExpiration;
