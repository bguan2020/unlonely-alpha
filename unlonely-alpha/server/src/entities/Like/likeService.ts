import { Like, User } from "@prisma/client";
import { noop } from "lodash";

import { Context } from "../../context";
export interface IHandleLikeInput {
  likedObj: LikeObj;
  likableId: number;
  value: number;
}

export enum LikeObj {
  HOSTEVENT = "HOSTEVENT",
  NFC = "NFC",
}

export const handleLike = async (
  data: IHandleLikeInput,
  user: User,
  ctx: Context
) => {
  const existingLike = await getLike(
    data.likedObj,
    data.likableId,
    user.address,
    ctx
  );

  const updateItemScore = async (likedObj: LikeObj, value: number) => {
    if (likedObj === LikeObj.HOSTEVENT) {
      return ctx.prisma.hostEvent.update({
        where: { id: Number(data.likableId) },
        data: {
          score: {
            increment: value,
          },
        },
      });
    }
    // if not hostEvent, it's an NFC
    return ctx.prisma.nFC.update({
      where: { id: Number(data.likableId) },
      data: {
        score: {
          increment: value,
        },
      },
    });
  };

  const createNewLike = (likedObj: LikeObj) => {
    if (likedObj === LikeObj.HOSTEVENT) {
      return ctx.prisma.like.create({
        data: {
          value: data.value,
          liker: {
            connect: { address: user.address },
          },
          hostEvent: {
            connect: { id: Number(data.likableId) },
          },
        },
      });
    }
    // if not hostEvent, it's an NFC
    return ctx.prisma.like.create({
      data: {
        value: data.value,
        liker: {
          connect: { address: user.address },
        },
        NFC: {
          connect: { id: Number(data.likableId) },
        },
      },
    });
  };

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
      return updateItemScore(data.likedObj, -data.value);
    }

    await updateExistingLike();
    return updateItemScore(data.likedObj, 2 * data.value);
  }

  await createNewLike(data.likedObj);
  return updateItemScore(data.likedObj, data.value);
};

export async function getLike(
  likedObj: LikeObj,
  likableId: number,
  likerAddress: string,
  ctx: Context
) {
  if (likedObj === LikeObj.HOSTEVENT) {
    const existingLike = await ctx.prisma.like.findFirst({
      where: {
        hostEventId: Number(likableId),
        liker: { address: likerAddress },
      },
    });

    if (!existingLike) {
      return null;
    } else {
      return existingLike;
    }
  }
  // if not hostEvent, then it's NFC
  const existingLike = await ctx.prisma.like.findFirst({
    where: {
      NFCId: Number(likableId),
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
  likedObj: LikeObj,
  likableId: number,
  likerAddress: string,
  ctx: Context
) {
  if (likedObj === LikeObj.HOSTEVENT) {
    const existingLike = await ctx.prisma.like.findFirst({
      where: {
        hostEventId: Number(likableId),
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
  // if not hostEvent, then it's NFC
  const existingLike = await ctx.prisma.like.findFirst({
    where: {
      NFCId: Number(likableId),
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
