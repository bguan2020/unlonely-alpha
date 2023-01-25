const { Client } = require("pg");
const ethers = require("ethers");
const fetch = require("node-fetch");
const { MerkleAPIClient } = require("@standard-crypto/farcaster-js");
const PrismaClient = require("@prisma/client").PrismaClient;

const parentCastHash = "0x0882f9c5ff45ac87a4b35de5168e22b085f6e66cbece6b1442cd8b02e945bb7f";

// connect to database
const client = new Client({
  host: "db-postgresql-sfo3-16817-do-user-11088919-0.b.db.ondigitalocean.com",
  port: 25060,
  database: "unlonely_v1_staging",
  user: "doadmin",
  password: "AVNS__XJW01bZjuI2pG6",
  ssl: {
    rejectUnauthorized: false,
  },
});

const prismaClient = new PrismaClient();

(async () => {
  // connect to db
  await client.connect(async (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to database");
    }
  });
  // connect to farcaster

  await client.query('LISTEN "Chat"');
  client.on("notification", async (msg) => {
    console.log(`Received chat: ${msg.payload}`);

    // get most recent single chat from prisma call
    const chat = await prismaClient.chat.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 1000),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    });
    console.log(chat[0])
    if (chat.length < 1) {
      return;
    }
    if (verifyCast(chat[0].text)) {
      console.log("verified text", chat[0].text);
      publishCast(chat[0].text);
    }


  });
})().catch((e) => console.error(e));

function verifyCast(cast) {
  if (cast.startsWith("@noFCplz") || cast.length > 320 || cast.length < 10) {
    return false;
  }
  return true;
}

async function publishCast(text) {
  // connect to farcaster
  const wallet = ethers.Wallet.fromMnemonic('dice exit onion number drama liberty club tennis speed method walk bright');

  const merkleClient = new MerkleAPIClient(wallet)

  const EXPIRY_DURATION_MS = 31536000000 // 1 year
  const bearerToken = await merkleClient.createAuthToken(EXPIRY_DURATION_MS)

  const fcResponse = await fetch("https://api.farcaster.xyz/v2/casts", {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'authorization': `Bearer ${bearerToken.secret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      parent: {
        fid: 548,
        hash: parentCastHash
      }
    })
  });
}
