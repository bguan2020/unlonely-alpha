/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

import users from "./fixtures/users";
import posts from "./fixtures/posts";

const prisma = new PrismaClient();

async function main() {
  // console.log("Start seeding ...");
  // console.log("Seeding users");
  // for (const u of Object.values(users)) {
  //   const user = await prisma.user.create({
  //     data: u,
  //   });
  //   console.log(`Created user with address: ${user.address}`);
  // }
  // console.log("Seeding Posts");
  // for (const p of posts) {
  //   const post = await prisma.post.create({ data: p });
  //   console.log(`Created post with id: ${post.id}`);
  // }
  // console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
