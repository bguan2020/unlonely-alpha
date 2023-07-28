import { PrismaClient, User } from "@prisma/client";
import { ContextFunction } from "apollo-server-core";
import { PrivyClient } from "@privy-io/server-auth";

import { findOrCreateUser } from "./utils/user";
import { verifyAuth } from "./utils/auth";

const prisma = new PrismaClient();
const privyClient = new PrivyClient(
  String(process.env.PRIVY_APP_ID),
  String(process.env.PRIVY_APP_SECRET)
);

export interface Context {
  prisma: PrismaClient;
  user: User | null;
  userIsAuthed: boolean;
}

export const getContext: ContextFunction = async ({
  req,
}): Promise<Context> => {
  const authToken = req.headers.authorization.replace("Bearer ", "");
  const address = req.headers["x-auth-address"];
  const signedMessage = req.headers["x-auth-signed-message"];

  const user = address ? await findOrCreateUser({ address }) : null;
  let validated = false;

  if (user && signedMessage) {
    validated = await verifyAuth({ user, signedMessage });
    // try {
    //   await privyClient.verifyAuthToken(authToken);
    //   validated = true;
    // } catch (e) {
    //   console.log("cannot validate privy token", e);
    // }
  }

  return {
    prisma: prisma,
    user: user,
    userIsAuthed: validated,
  };
};
