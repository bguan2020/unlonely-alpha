import { gql } from "@apollo/client";
import { useCallback } from "react";

import { useAuthedMutation } from "../apiClient/hooks";
import {
  HandleNfcMutation,
  HandleNfcMutationVariables,
} from "../generated/graphql";

type Props = {
  title: string;
  onError?: () => void;
};

const HANDLE_NFC_MUTATION = gql`
  mutation HandleNFC($data: HandleNFCInput!) {
    handleNFC(data: $data) {
      id
    }
  }

`;

const usePostNFC = ({ title, onError }: Props) => {
  const [mutate] = useAuthedMutation<
    HandleNfcMutation,
    HandleNfcMutationVariables
  >(HANDLE_NFC_MUTATION);

  const postNFC = useCallback(
    async (data) => {
      const mutationResult = await mutate({
        variables: { data: { title, ...data } },
      });

      const success = !!mutationResult?.data?.handleNFC;
      console.log(success);

      if (success) {
        console.log("success");
      } else {
        onError && onError();
      }

      return {
        success,
      };
    },
    [mutate, onError]
  );

  return { postNFC};
};

export default usePostNFC;
