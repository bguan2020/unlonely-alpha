import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import { PostChannelMutation, PostChannelMutationVariables } from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_CHANNEL_MUTATION = gql`
    mutation PostChannel($data: PostChannelInput!) {
      postChannel(data: $data) {
        id
      }
    }
`;

const usePostChannel = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<PostChannelMutation, PostChannelMutationVariables>(POST_CHANNEL_MUTATION);

  const postChannel = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              slug: data.slug,
              ownerAddress: data.ownerAddress,
              name: data.name,
              description: data.description,
              canRecord: data.canRecord,
              allowNfcs: data.allowNfcs,
            },
          },
        });

        const res = mutationResult?.data?.postChannel;
        /* eslint-disable no-console */
        if (res) {
          console.log("postChannel success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("postChannel", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postChannel, loading };
};

export default usePostChannel;
