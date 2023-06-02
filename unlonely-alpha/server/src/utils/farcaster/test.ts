const { Wallet } = require("ethers");
const { MerkleAPIClient } = require("@standard-crypto/farcaster-js");

const FC_MNEMONIC = "dice exit onion number drama liberty club tennis speed method walk bright"

if (!FC_MNEMONIC) {
  throw new Error('Missing Farcaster Recovery Phrase')
}

(async () => {
  const wallet = Wallet.fromMnemonic(FC_MNEMONIC)

  console.log({
    address: wallet.address,
    pkey: wallet._signingKey().privateKey,
  })
})()
