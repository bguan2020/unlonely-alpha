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
const replyTo = "0xcb549531f9ba604fd6b348b4da9364d29aafb8c20a46b5031514a623af747e0f"; // INSERT HERE

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