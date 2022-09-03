import { User } from "@prisma/client";

import { Context } from "../../context";

export interface IPostChatInput {
  text: string;
}

export const postFirstChat = (data: IPostChatInput, user: User, ctx: Context) => {
  return ctx.prisma.chat.create({
    data: {
      text: data.text,
      owner: {
        connect: { address: user.address },
      },
    },
  });
};

export const firstChatExists = async (user: User, ctx: Context) => {
  const data = await ctx.prisma.chat.findFirst({
    where: {
      owner: {
        address: user.address,
      },
    },
  });
  console.log(data);
  return !data;
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};
