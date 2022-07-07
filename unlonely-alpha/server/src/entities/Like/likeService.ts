import { User } from "@prisma/client";
import { noop } from "lodash";

import { Context } from "../../context";
export interface IHandleLikeInput {
  commentId: number;
}

export const handleLike = async (
  data: IHandleLikeInput,
  user: User,
  ctx: Context
) => {
  const existingLike = await getLike(data.commentId, user.address, ctx);

  const updateItemScore = async (value: number) => {
    await ctx.prisma.user.update({
      where: { address: user.address },
      data: {
        reputation: {
          increment: value,
        },
      },
    });

    return ctx.prisma.comment.update({
      where: { id: Number(data.commentId) },
      data: {
        score: {
          increment: value,
        },
      },
    });
  };

  const createNewLike = () =>
    ctx.prisma.like.create({
      data: {
        liker: {
          connect: { address: user.address },
        },
        comment: {
          connect: { id: Number(data.commentId) },
        },
      },
    });

  const deleteExistingLike = existingLike
    ? async () => {
        await ctx.prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });
      }
    : noop;

  if (existingLike) {
    await deleteExistingLike();
    return updateItemScore(-1);
  } else {
    await createNewLike();
    return updateItemScore(1);
  }
};

export async function getLike(
  commentId: number,
  likerAddress: string,
  ctx: Context
) {
  const existingLike = await ctx.prisma.like.findFirst({
    where: {
      commentId: Number(commentId),
      liker: { address: likerAddress },
    },
  });

  if (!existingLike) {
    return null;
  } else {
    return existingLike;
  }
}

export async function isLiked(
  commentId: number,
  likerAddress: string,
  ctx: Context
) {
  const existingLike = await ctx.prisma.like.findFirst({
    where: {
      commentId: Number(commentId),
      liker: { address: likerAddress },
    },
  });

  if (!existingLike) {
    return false;
  } else {
    return true;
  }
}
