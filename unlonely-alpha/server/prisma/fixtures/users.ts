import { Prisma } from "@prisma/client";

const users: { [person: string]: Prisma.UserCreateInput } = {
  brian: {
    address: "0x141Edb16C70307Cf2F0f04aF2dDa75423a0E1bEa",
    bio: "CTO",
    productName: "Pravna",
    productImageUrl:
      "https://ipfs.infura.io/ipfs/QmfDgRFTsAMLur4i6w3jRBVgfZ64wx1PeXQ2xJ56YirfFP",
    reputation: 39,
  },
  danny: {
    address: "0xcc4a70d7468c47A7981cDe8D8d651dFABf2D2b42",
    bio: "CEO",
    productName: "Azuki Collection",
    productImageUrl:
      "https://ipfs.infura.io/ipfs/QmRexAdrS5KEq68eoAFTWxmiuLxMbdJ5mEtE7U6JHd9Vhv",
    reputation: 203,
  },
  matt: {
    address: "0xcc4a70d7468c47A7981cDe8Dasdfsadfasdf",
    bio: "Founder at Portal",
    productName: "CryptoPunks",
    productImageUrl:
      "https://ipfs.infura.io/ipfs/QmaCi6FGakLTx8oXaE1seTEw7rZgwKAjXsznPceuKv8sH4",
    reputation: 420,
  },
  pierratt: {
    address: "0x207CDbAF5060F9189D9Bd5C75FF30523495d8616",
    username: "pieratt.eth",
    productName: "Augiart",
    productImageUrl:
      "https://ipfs.infura.io/ipfs/QmU16wk1z4vLN11hYQoqjTcXrLzSPkxgV51EPjsLAPAXbW",
    reputation: 49,
  },
  jamil: {
    address: "0x39D4cfb24b6431297b62BcFF03748F21e2617D7a",
    username: "jamil.eth",
    productImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/17081.png",
    productName: "LooksRare",
    reputation: 109,
  },
  apurn: {
    address: "0x9fE15c2783529777253C8a7C62eAE3687ff9688c",
    username: "apurn.eth",
    productName: "Doodles NFT",
    productImageUrl:
      "https://ipfs.infura.io/ipfs/Qmarv7zkeQxH1egjKoRzQGNTgyMM9SKTAr85LW2D2Gh1KN",
    reputation: 207,
  },
};

export default users;
