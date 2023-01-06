import {
  publishCast,
} from "@standard-crypto/farcaster-js";
import { Wallet } from "ethers";
import wallet from "./wallet";

const replyTo = "0x48c187b91a1455b4b76afd116880df1960d6c0ef909df991c6b9b2757f8cd5d4"; // INSERT HERE

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