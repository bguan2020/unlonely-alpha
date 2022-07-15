import { User } from "@prisma/client";
import { noop, update } from "lodash";

import { Context } from "../../context";
export interface IHandleLikeInput {
  videoId: number;
  value: number;
}

export const handleLike = async (
  data: IHandleLikeInput,
  user: User,
  ctx: Context
) => {
  const existingLike = await getLike(data.videoId, user.address, ctx);

  const updateItemScore = async (value: number) => {
    await ctx.prisma.user.update({
      where: { address: user.address },
      data: {
        reputation: {
          increment: value,
        },
      },
    });

    return ctx.prisma.video.update({
      where: { id: Number(data.videoId) },
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
        value: data.value,
        liker: {
          connect: { address: user.address },
        },
        video: {
          connect: { id: Number(data.videoId) },
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

  const updateExistingLike = existingLike
    ? async () => {
        await ctx.prisma.like.update({
          where: {
            id: existingLike.id,
          },
          data: {
            value: data.value,
          },
        });
      }
    : noop;

  if (existingLike) {
    const changedLikeDirection = existingLike.value !== data.value;

    if (!changedLikeDirection) {
      await deleteExistingLike();
      return updateItemScore(data.value == 1 ? -1 : 1);
    }

    await updateExistingLike();
    return updateItemScore(data.value == 1 ? 2 : -2);
  }

  await createNewLike();
  return updateItemScore(data.value == 1 ? 1 : -1);
};

export async function getLike(
  videoId: number,
  likerAddress: string,
  ctx: Context
) {
  const existingLike = await ctx.prisma.like.findFirst({
    where: {
      videoId: Number(videoId),
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
  videoId: number,
  likerAddress: string,
  ctx: Context
) {
  const existingLike = await ctx.prisma.like.findFirst({
    where: {
      videoId: Number(videoId),
      liker: { address: likerAddress },
    },
  });

  if (!existingLike) {
    return false;
  } else {
    if (existingLike.value === 1) {
      return true;
    }
    return false;
  }
}

export async function isSkipped(
  videoId: number,
  likerAddress: string,
  ctx: Context
) {
  const existingLike = await ctx.prisma.like.findFirst({
    where: {
      videoId: Number(videoId),
      liker: { address: likerAddress },
    },
  });

  if (!existingLike) {
    return false;
  } else {
    if (existingLike.value === -1) {
      return true;
    }
    return false;
  }
}
