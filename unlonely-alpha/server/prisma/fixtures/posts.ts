import { Prisma } from "@prisma/client";

import users from "./users";

const posts: Prisma.PostCreateInput[] = [
  {
    name: "Pravna",
    description:
      "Pravna is a crypto news source. Vote with $PRVN to power the news network!",
    owner: {
      connect: { address: users.brian.address },
    },
    imageUrl:
      "https://ipfs.infura.io/ipfs/QmfDgRFTsAMLur4i6w3jRBVgfZ64wx1PeXQ2xJ56YirfFP",
  },
  {
    name: "Azuki Collection",
    description:
      "Azuki NFTs are NFTs that mean something. something cool. follow us @azuki_nft.",
    owner: {
      connect: { address: users.matt.address },
    },
    imageUrl:
      "https://ipfs.infura.io/ipfs/QmRexAdrS5KEq68eoAFTWxmiuLxMbdJ5mEtE7U6JHd9Vhv",
  },
  {
    name: "CryptoPunks",
    description: "You know who we are.",
    owner: {
      connect: { address: users.pierratt.address },
    },
    imageUrl:
      "https://ipfs.infura.io/ipfs/QmaCi6FGakLTx8oXaE1seTEw7rZgwKAjXsznPceuKv8sH4",
  },
  {
    name: "Augiart",
    description:
      "Augiart is an NFT marketplace for restaurants and the hospitality industry. Buy a dish, get it free once every two weeks forever!",
    owner: {
      connect: { address: users.jamil.address },
    },
    imageUrl:
      "https://ipfs.infura.io/ipfs/QmU16wk1z4vLN11hYQoqjTcXrLzSPkxgV51EPjsLAPAXbW",
  },
  {
    name: "LooksRare",
    description:
      "LooksRare is the community-first NFT marketplace with rewards for participating. Buy NFTs (or sell 'em) to earn rewards. Explore the market to get started.",
    owner: {
      connect: { address: users.jamil.address },
    },
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/17081.png",
  },
  {
    name: "Doodles NFT",
    description:
      "Doodles are a collection of 10,000 NFTs (non-fungible tokens) that are made up of hundreds of exciting visual traits designed by Burnt Toast. Hand-drawn Doodles include skellys, cats, aliens, apes and mascots.",
    owner: {
      connect: { address: users.apurn.address },
    },
    imageUrl:
      "https://ipfs.infura.io/ipfs/Qmarv7zkeQxH1egjKoRzQGNTgyMM9SKTAr85LW2D2Gh1KN",
  },
];

export default posts;
