import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import {
  PostTaskMutation,
  PostTaskMutationVariables,
} from "../generated/graphql";
import { useAuthedMutation } from "../apiClient/hooks";

const POST_TASK_MUTATION = gql`
  mutation PostTask($data: PostTaskInput!) {
    postTask(data: $data) {
      id
    }
  }
`;

const usePostTask = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostTaskMutation,
    PostTaskMutationVariables
  >(POST_TASK_MUTATION);

  const postTask = useCallback(
    async (data) => {
      setLoading(true);
      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.postTask
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { postTask, loading };
};

export default usePostTask;
