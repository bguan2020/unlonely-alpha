import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import { TrimVideoInput, TrimVideoMutation, TrimVideoMutationVariables } from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
mutation TrimVideo($data: TrimVideoInput!) {
  trimVideo(data: $data)
}
`;

const useTrimVideo = ({ onError }: Props) => {
  const [mutate] = useAuthedMutation<TrimVideoMutation, TrimVideoMutationVariables>(MUTATION);

  const trimVideo = useCallback(
    async (data: TrimVideoInput) => {
      let res = null;
      const mutationResult = await mutate({
        variables: {
          data: {
            startTime: data.startTime,
            endTime: data.endTime,
            videoLink: data.videoLink,
            name: data.name,
          },
        },
      });
      res = mutationResult?.data?.trimVideo;
      if (res) {
        console.log("useTrimVideo TrimVideoFromLivepeer success", res);
      } else {
        onError && onError();
      }
      return {
        res,
      };
    },
    [mutate, onError]
  );

  return { trimVideo };
};

export default useTrimVideo;
