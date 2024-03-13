import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  UpdateLivepeerStreamDataMutation,
  UpdateLivepeerStreamDataMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
  mutation UpdateLivepeerStreamData($data: UpdateLivepeerStreamDataInput!) {
    updateLivepeerStreamData(data: $data) {
      streamKey
      record
      playbackId
      isActive
    }
  }
`;

const useUpdateLivepeerStreamData = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateLivepeerStreamDataMutation,
    UpdateLivepeerStreamDataMutationVariables
  >(MUTATION);

  const updateLivepeerStreamData = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              streamId: data.streamId,
              canRecord: data.canRecord,
            },
          },
        });

        const res = mutationResult?.data?.updateLivepeerStreamData;

        if (res) {
          console.log("updateLivepeerStreamData success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateLivepeerStreamData", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateLivepeerStreamData, loading };
};

export default useUpdateLivepeerStreamData;
