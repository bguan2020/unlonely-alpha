import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import { PostTempTokenMutation, PostTempTokenMutationVariables } from "../../generated/graphql";

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
      ownerAddress
      name
      id
      endUnixTimestamp
      channelId
      chainId
    }
  }
`;

const usePostTempToken = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<PostTempTokenMutation, PostTempTokenMutationVariables>(
    POST_TEMP_TOKEN_MUTATION
  );

  const postTempToken = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
                tokenAddress: data.tokenAddress as string,
                symbol: data.symbol as string,
                streamerFeePercentage: String(data.streamerFeePercentage as bigint),
                protocolFeePercentage: String(data.protocolFeePercentage as bigint),
                ownerAddress: data.ownerAddress as string,
                name: data.name as string,
                endUnixTimestamp: String(data.endUnixTimestamp as bigint),
                channelId: data.channelId as number,
                chainId: data.chainId as number,
            },
          },
        });

        const res = mutationResult?.data?.postTempToken;
        if (res) {
          console.log("success");
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
