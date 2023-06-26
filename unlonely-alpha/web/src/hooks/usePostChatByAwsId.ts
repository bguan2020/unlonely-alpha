import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import {
  PostChatByAwsIdMutation,
  PostChatByAwsIdMutationVariables,
} from "../generated/graphql";
import { useAuthedMutation } from "../apiClient/hooks";

const POST_CHAT_BY_AWSID_MUTATION = gql`
  mutation PostChatByAwsId($data: PostChatByAwsIdInput!) {
    postChatByAwsId(data: $data) {
      id
    }
  }
`;

const usePostChatByAwsId = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostChatByAwsIdMutation,
    PostChatByAwsIdMutationVariables
  >(POST_CHAT_BY_AWSID_MUTATION);

  const postChatByAwsId = useCallback(
    async (data) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.postChatByAwsId
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }
      setLoading(false);
    },
    [mutate, onError]
  );

  return { postChatByAwsId, loading };
};

export default usePostChatByAwsId;
