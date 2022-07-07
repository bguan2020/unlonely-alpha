import { gql } from "@apollo/client";
import { useCallback } from "react";

import { useAuthedMutation } from "../apiClient/hooks";
import {
  PostCommentMutation,
  PostCommentMutationVariables,
} from "../generated/graphql";
import Comment from "../components/Comment";

type Props = {
  videoId: number;
  onError?: () => void;
};

const POST_COMMENT_MUTATION = gql`
  mutation PostComment($data: PostCommentInput!) {
    postComment(data: $data) {
      video {
        id
        youtubeId
        comments {
          id
          ...Comment_comment
        }
      }
    }
  }

  ${Comment.fragments.comment}
`;

const usePostComment = ({ videoId, onError }: Props) => {
  const [mutate] = useAuthedMutation<
    PostCommentMutation,
    PostCommentMutationVariables
  >(POST_COMMENT_MUTATION);

  const postComment = useCallback(
    async (data) => {
      const mutationResult = await mutate({
        variables: { data: { videoId, ...data } },
      });

      const success = !!mutationResult?.data?.postComment;

      if (success) {
        console.log("success");
      } else {
        onError && onError();
      }

      return {
        success,
      };
    },
    [videoId, mutate, onError]
  );

  return { postComment };
};

export default usePostComment;
