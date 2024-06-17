import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  PostTempTokenInput,
  PostTempTokenMutation,
  PostTempTokenMutationVariables,
  TempTokenType,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_TEMP_TOKEN_MUTATION = gql`
  mutation PostTempToken($data: PostTempTokenInput!) {
    postTempToken(data: $data) {
      tokenAddress
      symbol
      streamerFeePercentage
      protocolFeePercentage
      creationBlockNumber
      factoryAddress
      ownerAddress
      id
      name
      highestTotalSupply
      endUnixTimestamp
      minBaseTokenPrice
      channelId
      chainId
    }
  }
`;

const usePostTempToken = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostTempTokenMutation,
    PostTempTokenMutationVariables
  >(POST_TEMP_TOKEN_MUTATION);

  const postTempToken = useCallback(
    async (data: PostTempTokenInput) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              tokenAddress: data.tokenAddress as string,
              symbol: data.symbol as string,
              streamerFeePercentage: data.streamerFeePercentage as string,
              protocolFeePercentage: data.protocolFeePercentage as string,
              ownerAddress: data.ownerAddress as string,
              factoryAddress: data.factoryAddress as string,
              creationBlockNumber: data.creationBlockNumber as string,
              name: data.name as string,
              endUnixTimestamp: data.endUnixTimestamp as string,
              channelId: data.channelId as number,
              chainId: data.chainId as number,
              tokenType: data.tokenType as TempTokenType,
              minBaseTokenPrice: data.minBaseTokenPrice as bigint,
            },
          },
        });

        const res = mutationResult?.data?.postTempToken;
        if (res) {
          console.log("postTempToken success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("postTempToken", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postTempToken, loading };
};

export default usePostTempToken;
