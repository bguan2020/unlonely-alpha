import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import { RequestUploadFromLivepeerMutation, RequestUploadFromLivepeerMutationVariables } from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
    mutation RequestUploadFromLivepeer($data: RequestUploadFromLivepeerInput!) {
      requestUploadFromLivepeer(data: $data) {
        url
        tusEndpoint
        task {
          id
        }
        asset {
          userId
          status {
            updatedAt
            progress
            phase
            errorMessage
          }
        }
      }
    }
`;

const useRequestUpload = ({ onError }: Props) => {
  const [mutate] = useAuthedMutation<RequestUploadFromLivepeerMutation, RequestUploadFromLivepeerMutationVariables>(MUTATION);

  const requestUpload = useCallback(
    async (data) => {
      let res = null;
      const mutationResult = await mutate({
        variables: {
          data: {
            name: data.name,
          },
        },
      });
      res = mutationResult?.data?.requestUploadFromLivepeer;
      if (res?.tusEndpoint) {
        console.log("useRequestUpload requestUploadFromLivepeer success", res);
      } else {
        onError && onError();
      }
      return {
        res,
      };
    },
    [mutate, onError]
  );

  return { requestUpload };
};

export default useRequestUpload;
