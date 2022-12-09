import { PrismaClient } from "@prisma/client";
import { getEnsName } from "./ens";

const prisma = new PrismaClient();

export const findOrCreateUser = async ({ address }: { address: string }) => {
  let user = await prisma.user.findUnique({
    where: {
      address: address,
    },
  });
  console.log(user, "find or create user")

  if (!user) {
    const username = await getEnsName(address);
    user = await prisma.user.create({
      data: {
        address: address,
        username: username,
      },
    });
    console.log(user, "created user");
  }
  console.log(user);

  return user;
};
