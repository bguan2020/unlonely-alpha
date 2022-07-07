import { PrismaClient } from "@prisma/client";
import { getEnsName } from "./ens";

const prisma = new PrismaClient();

export const findOrCreateUser = async ({ address }: { address: string }) => {
  let user = await prisma.user.findUnique({
    where: {
      address: address,
    },
  });

  if (!user) {
    const username = await getEnsName(address);
    user = await prisma.user.create({
      data: {
        address: address,
        username: username,
      },
    });
  }

  return user;
};
