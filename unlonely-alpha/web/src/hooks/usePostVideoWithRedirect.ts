import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import {
  PostVideoMutation,
  PostVideoMutationVariables,
} from "../generated/graphql";
import { useAuthedMutation } from "../apiClient/hooks";

const POST_VIDEO_MUTATION = gql`
  mutation PostVideo($data: PostVideoInput!) {
    postVideo(data: $data) {
      id
    }
  }
`;

const usePostVideoWithRedirect = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostVideoMutation,
    PostVideoMutationVariables
  >(POST_VIDEO_MUTATION);

  const postVideo = useCallback(
    async (data) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.postVideo
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      await router.push(`/channels/1`);
      setLoading(false);
    },
    [mutate, onError, router]
  );

  return { postVideo, loading };
};

export default usePostVideoWithRedirect;
