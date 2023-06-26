import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import {
  PostFirstChatMutation,
  PostFirstChatMutationVariables,
} from "../../generated/graphql";
import { useAuthedMutation } from "../../apiClient/hooks";

const POST_CHAT_MUTATION = gql`
  mutation PostFirstChat($data: PostChatInput!) {
    postFirstChat(data: $data) {
      id
    }
  }
`;

const usePostFirstChat = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostFirstChatMutation,
    PostFirstChatMutationVariables
  >(POST_CHAT_MUTATION);

  const postFirstChat = useCallback(
    async (data, { isFirst }) => {
      setLoading(true);
      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.postFirstChat
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }
      if (isFirst) window.location.reload();
      setLoading(false);
    },
    [mutate, onError]
  );

  return { postFirstChat, loading };
};

export default usePostFirstChat;
