import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import { UpdateTempTokenHasRemainingFundsForCreatorMutation, UpdateTempTokenHasRemainingFundsForCreatorMutationVariables } from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
  mutation UpdateTempTokenHasRemainingFundsForCreator($data: UpdateTempTokenHasRemainingFundsForCreatorInput!) {
    updateTempTokenHasRemainingFundsForCreator(data: $data) {
        tokenAddress
        hasRemainingFundsForCreator
        channelId
        chainId
        balance
      }
  }
`;

const useUpdateTempTokenHasRemainingFundsForCreator = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<UpdateTempTokenHasRemainingFundsForCreatorMutation, UpdateTempTokenHasRemainingFundsForCreatorMutationVariables>(
    MUTATION
  );

  const updateTempTokenHasRemainingFundsForCreator = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
                channelId: data.channelId as number,
                chainId: data.chainId as number,
            },
          },
        });

        const res = mutationResult?.data?.updateTempTokenHasRemainingFundsForCreator;
        if (res) {
          console.log("updateTempTokenHasRemainingFundsForCreator success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateTempTokenHasRemainingFundsForCreator", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateTempTokenHasRemainingFundsForCreator, loading };
};

export default useUpdateTempTokenHasRemainingFundsForCreator;
