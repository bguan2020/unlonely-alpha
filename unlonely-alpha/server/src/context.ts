import { PrismaClient, User } from "@prisma/client";
import { ContextFunction } from "apollo-server-core";

import { verifyAuth } from "./utils/auth";
import { findOrCreateUser } from "./utils/user";

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  user: User | null;
  userIsAuthed: boolean;
}

export const getContext: ContextFunction = async ({
  req,
}): Promise<Context> => {
  const address = req.headers["x-auth-address"];
  const signedMessage = req.headers["x-auth-signed-message"];

  const user = address ? await findOrCreateUser({ address }) : null;
  let validated = false;

  if (user && signedMessage) {
    validated = await verifyAuth({ user, signedMessage });
  }

  return {
    prisma: prisma,
    user: user,
    userIsAuthed: validated,
  };
};
