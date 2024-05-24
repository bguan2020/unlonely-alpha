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
  const authToken = req.headers.authorization
    ? req.headers.authorization.replace("Bearer ", "")
    : null;

  let validated = false;
  const latestVerifiedAddress = req.headers["latest-verified-address"] || null;

  try {
    const { userId } = await privyClient.verifyAuthToken(authToken);

    console.log(
      "Authentication underway:",
      new Date(Date.now()).toLocaleString(),
      latestVerifiedAddress,
      userId
    );

    validated = true;
  } catch (e) {
    // if (authToken !== null) console.error("Authentication failed  :", e);
  }

  const user = latestVerifiedAddress ? await findOrCreateUser({ address: latestVerifiedAddress }) : null;

  if (user)
    console.log(
      "Authentication success :",
      new Date(Date.now()).toLocaleString(),
      user.address
    );

  return {
    prisma: prisma,
    user: user,
    userIsAuthed: validated,
  };
};
