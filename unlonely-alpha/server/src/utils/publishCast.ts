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
const replyTo = "0xe090bb94ad71cf5aef52c6d956afe7de2e14f7eec0c7725fcd067746c9ec8572"; // INSERT HERE

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