import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  PostSharesEventMutation,
  PostSharesEventMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_SHARES_EVENT_MUTATION = gql`
  mutation PostSharesEvent($data: PostSharesEventInput!) {
    postSharesEvent(data: $data) {
      id
    }
  }
`;

const usePostSharesEvent = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostSharesEventMutation,
    PostSharesEventMutationVariables
  >(POST_SHARES_EVENT_MUTATION);

  const postSharesEvent = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              channelId: data.id,
              sharesSubjectQuestion: data.sharesSubjectQuestion,
              sharesSubjectAddress: data.sharesSubjectAddress,
            },
          },
        });

        const res = mutationResult?.data?.postSharesEvent;

        if (res) {
          console.log("postSharesEvent success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("postSharesEvent", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postSharesEvent, loading };
};

export default usePostSharesEvent;
