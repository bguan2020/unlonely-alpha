import {
  publishCast,
} from "@standard-crypto/farcaster-js";
import { Wallet } from "ethers";
import wallet from "./wallet";

const replyTo = "0x323fb0639f0baa90c14a05ee5d1cdc8adfd7f54d8ae3e07400bdf846d5c7acf8"; // INSERT HERE

export default async function _publishCast(text: string) { 
  const signer = new Wallet(wallet.privateKey);
  const replyObj = {
    fid: 548,
    hash: replyTo
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // const signedCast = await Farcaster.signCast(unsignedCast, signer);
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const cast = await publishCast(signer, text, replyObj);
    console.log("3: published cast");
    return cast;

  } catch (e) {
    console.log("4: error publishing cast", e);
    return e;
  }
}