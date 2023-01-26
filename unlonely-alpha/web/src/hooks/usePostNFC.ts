import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback } from "react";

import { useAuthedMutation } from "../apiClient/hooks";
import {
  HandleNfcMutation,
  HandleNfcMutationVariables,
} from "../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const HANDLE_NFC_MUTATION = gql`
  mutation HandleNFC($data: HandleNFCInput!) {
    handleNFC(data: $data) {
      id
    }
  }
`;

const usePostNFC = ({ onError }: Props) => {
  const [mutate] = useAuthedMutation<
    HandleNfcMutation,
    HandleNfcMutationVariables
  >(HANDLE_NFC_MUTATION);

  const postNFC = useCallback(
    async (data) => {
      const mutationResult = await mutate({
        variables: { data: { title: data.title, videoLink: data.videoLink } },
      });

      const res = mutationResult?.data?.handleNFC;
      /* eslint-disable no-console */
      if (res) {
        console.log("success");
      } else {
        onError && onError();
      }

      return {
        res,
      };
    },
    [mutate, onError]
  );

  return { postNFC };
};

export default usePostNFC;
