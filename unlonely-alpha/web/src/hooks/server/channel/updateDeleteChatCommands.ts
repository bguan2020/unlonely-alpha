import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";
import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  UpdateDeleteChatCommandsMutation,
  UpdateDeleteChatCommandsMutationVariables,
} from "../../../generated/graphql";

const UPDATE_DELETE_CHAT_COMMANDS = gql`
  mutation UpdateDeleteChatCommands($data: UpdateDeleteChatCommandInput!) {
    updateDeleteChatCommands(data: $data) {
      id
      chatCommands {
        command
        response
      }
    }
  }
`;

const useUpdateDeleteChatCommands = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateDeleteChatCommandsMutation,
    UpdateDeleteChatCommandsMutationVariables
  >(UPDATE_DELETE_CHAT_COMMANDS);

  const updateDeleteChatCommands = useCallback(
    async (data) => {
      setLoading(true);

      try {
        const cleanedChatCommands = data.chatCommands.map(
          ({ __typename, ...rest }: { __typename: any }) => rest
        );

        const mutationResult = await mutate({
          variables: { data: { ...data, chatCommands: cleanedChatCommands } },
        });
      } catch (e) {
        console.log(JSON.stringify(e, null, 2));
      }

      // if (
      //   mutationResult.errors ||
      //   !mutationResult.data ||
      //   !mutationResult.data.updateDeleteChatCommands
      // ) {
      //   onError && onError(mutationResult.errors);
      //   setLoading(false);
      //   return;
      // }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateDeleteChatCommands, loading };
};

export default useUpdateDeleteChatCommands;
