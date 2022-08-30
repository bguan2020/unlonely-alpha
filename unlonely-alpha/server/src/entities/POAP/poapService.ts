import { User } from "@prisma/client";

import { Context } from "../../context";

export interface IGetPoapInput {
  date: string;
}

export const getPoap = async (data: IGetPoapInput, ctx: Context) => {
  const poapData = await ctx.prisma.poap.findFirst({
    where: { date: data.date, isUsed: false },
  });

  if (poapData) {
    const update = await ctx.prisma.poap.update({
      where: { id: poapData.id },
      data: { isUsed: true },
    });
  }
  return poapData;
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};
