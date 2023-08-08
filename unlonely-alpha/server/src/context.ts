import { PrismaClient, User } from "@prisma/client";
import { ContextFunction } from "apollo-server-core";
import { PrivyClient } from "@privy-io/server-auth";

// import { verifyAuth } from "./utils/auth";
import { findOrCreateUser } from "./utils/user";

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
  const signedMessage = req.headers["x-auth-signed-message"];

  console.log(signedMessage);

  let validated = false;
  let address = null;
  try {
    const { userId } = await privyClient.verifyAuthToken(authToken);
    console.log(userId);
    const user = await privyClient.getUser(userId);
    address = user.wallet?.address;
    console.log(address);
    validated = true;
  } catch (e) {
    console.log("cannot validate privy token", e);
  }

  console.log("authToken", authToken, "address", address, "signedMessage", signedMessage);
  const user = address ? await findOrCreateUser({ address }) : null;

  return {
    prisma: prisma,
    user: user,
    userIsAuthed: validated,
  };
};
