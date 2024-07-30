import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import { ConcatenateOutroToTrimmedVideoInput, ConcatenateOutroToTrimmedVideoMutation, ConcatenateOutroToTrimmedVideoMutationVariables } from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
  mutation ConcatenateOutroToTrimmedVideo($data: ConcatenateOutroToTrimmedVideoInput!) {
    concatenateOutroToTrimmedVideo(data: $data)
  }
`;

const useConcatenateOutroTrimmedVideo = ({ onError }: Props) => {
  const [mutate] = useAuthedMutation<ConcatenateOutroToTrimmedVideoMutation, ConcatenateOutroToTrimmedVideoMutationVariables>(MUTATION);

  const concatenateOutroTrimmedVideo = useCallback(
    async (data: ConcatenateOutroToTrimmedVideoInput) => {
      let res = null;
      const mutationResult = await mutate({
        variables: {
          data: {
            trimmedVideoFileName: data.trimmedVideoFileName,
            name: data.name,
          },
        },
      });
      res = mutationResult?.data?.concatenateOutroToTrimmedVideo;
      if (res) {
        console.log("useConcatenateOutroTrimmedVideo ConcatenateOutroTrimmedVideoFromLivepeer success", res);
      } else {
        onError && onError();
      }
      return {
        res,
      };
    },
    [mutate, onError]
  );

  return { concatenateOutroTrimmedVideo };
};

export default useConcatenateOutroTrimmedVideo;
