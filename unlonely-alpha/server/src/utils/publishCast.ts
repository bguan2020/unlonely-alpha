import {
  Farcaster,
  FarcasterGuardianContentHost,
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
const replyTo = "0x7e5f5cbb7ac5f3aca72df77c008f71b1793e2fdb893cbfaa935eda5ab56821c6"; // INSERT HERE
const _defaultFarcaster = new Farcaster()
export default async function publishCast(text: string) { 
  const contentHost = new FarcasterGuardianContentHost(wallet.privateKey);
  const signer = new Wallet(wallet.privateKey);
  const unsignedCast = await _defaultFarcaster.prepareCast({
    fromUsername: "briang",
    text,
    replyTo,
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const signedCast = await Farcaster.signCast(unsignedCast, signer);
  await contentHost.publishCast(signedCast);
  console.log("3: published cast");
  return signedCast;
}