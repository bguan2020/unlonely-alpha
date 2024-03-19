import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import { VerifyTempTokenMutation, VerifyTempTokenMutationVariables } from "../../generated/graphql";
type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};
const MUTATION = gql`
    mutation VerifyTempToken($data: VerifyTempTokenInput!) {
        verifyTempToken(data: $data) {
            status
            result
            message
        }
    }
`;

const useVerifyTempToken = ({ onError }: Props) => {
  const [mutate] = useAuthedMutation<VerifyTempTokenMutation, VerifyTempTokenMutationVariables>(MUTATION);

  const verifyTempToken = useCallback(
    async (data) => {
      const mutationResult = await mutate({
        variables: {
          data: {
            tempTokenContractAddress: data.tempTokenContractAddress,
            encodedConstructorArguments: data.encodedConstructorArguments,
          },
        },
      });

      const res = mutationResult?.data?.verifyTempToken;
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

  return { verifyTempToken };
};

export default useVerifyTempToken;
