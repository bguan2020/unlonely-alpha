import { User } from "@prisma/client";
import { noop } from "lodash";

import { Context } from "../../context";
export interface IHandleLikeInput {
  hostEventId: number;
  value: number;
}

export const handleLike = async (
  data: IHandleLikeInput,
  user: User,
  ctx: Context
) => {
  const existingLike = await getLike(data.hostEventId, user.address, ctx);

  const updateItemScore = async (value: number) => {
    return ctx.prisma.hostEvent.update({
      where: { id: Number(data.hostEventId) },
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
        hostEvent: {
          connect: { id: Number(data.hostEventId) },
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
      return updateItemScore(-data.value);
    }

    await updateExistingLike();
    return updateItemScore(2*data.value);
  }

  await createNewLike();
  return updateItemScore(data.value);
};

export async function getLike(
  hostEventId: number,
  likerAddress: string,
  ctx: Context
) {
  const existingLike = await ctx.prisma.like.findFirst({
    where: {
      hostEventId: Number(hostEventId),
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
  hostEventId: number,
  likerAddress: string,
  ctx: Context
) {
  const existingLike = await ctx.prisma.like.findFirst({
    where: {
      hostEventId: Number(hostEventId),
      liker: { address: likerAddress },
    },
  });

  if (!existingLike) {
    return false;
  } else {
    if (existingLike.value > 0) {
      return true;
    }
    return false;
  }
}

export async function isDisliked(
  hostEventId: number,
  likerAddress: string,
  ctx: Context
) {
  const existingLike = await ctx.prisma.like.findFirst({
    where: {
      hostEventId: Number(hostEventId),
      liker: { address: likerAddress },
    },
  });

  if (!existingLike) {
    return false;
  } else {
    if (existingLike.value < 0) {
      return true;
    }
    return false;
  }
}
