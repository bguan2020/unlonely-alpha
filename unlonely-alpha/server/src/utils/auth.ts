import { PrismaClient, User } from "@prisma/client";
import { ethers } from "ethers";
import { Time } from "graphql-scalars/mocks";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

export const authMessage = async ({
  address,
  sigTimestamp,
}: {
  address: string;
  sigTimestamp: bigint | null;
}) => {
  let newTimestamp;
  if (!sigTimestamp) {
    new Date();
    const { sigTimestamp } = await prisma.user.update({
      where: { address: address },
      data: {
        sigTimestamp: Date.now(),
      },
    });
    newTimestamp = sigTimestamp;
  }
  const timestamp = sigTimestamp ? sigTimestamp : newTimestamp;
  return `I authorize Unlonely to store this signature for future site interactions. You only have to do this once.
${address}

TIMESTAMP: ${timestamp}`;
};

export interface IAuthInput {
  signedMessage: string;
  user: User;
}

export const verifyAuth = async ({
  signedMessage,
  user,
}: IAuthInput): Promise<boolean> => {
  const address = user.address;

  if (!user.signature) {
    await prisma.user.update({
      where: { address: address },
      data: { signature: signedMessage },
    });
  }

  try {
    // Try to extract the address from the signed nonce
    const signerAddr = ethers.utils.verifyMessage(
      await authMessage({ address, sigTimestamp: user.sigTimestamp }),
      signedMessage
    );

    const valid = signerAddr === address;

    if (!valid) return false;

    // // Update the nonce, as the current one has now been used
    // await prisma.user.update({
    //   where: { address: address },
    //   data: { nonce: nanoid() },
    // });

    return valid;
  } catch (err) {
    // `verifyMessage` throws an error if no address can be extracted, so the signed
    // nonce is invalid
    return false;
  }
};
