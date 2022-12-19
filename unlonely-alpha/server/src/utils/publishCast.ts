import {
  publishCast,
} from "@standard-crypto/farcaster-js";
import { Wallet } from "ethers";
import wallet from "./wallet";

/**
 * Credit: https://gist.github.com/gskril/59d16fefbc411e61c9cce41963f3accf
 * MODIFIED FROM STANDARD-CRYPTO LIBRARY
 * Signs and publishes a simple text string.
 * The cast will be attributed to the username currently registered
 * to the given private key's address.
 */
const replyTo = "0xe2f8246955c9dba7a2457c887d2cf06920d70edac9fbec80d18e8cfeef4a790f"; // INSERT HERE

export default async function _publishCast(text: string) { 
  const signer = new Wallet(wallet.privateKey);
  const replyObj = {
    fid: 548,
    hash: replyTo
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // const signedCast = await Farcaster.signCast(unsignedCast, signer);
  const cast = await publishCast(signer, text, replyObj);
  console.log("3: published cast");
  return cast;
}