import { PrismaClient } from "@prisma/client";

import { fetchSocial } from "./identityResolver";

const prisma = new PrismaClient();

// Create a map to store ongoing user creation requests
const userCreationPromises = new Map();

export const findOrCreateUser = async ({ address }: { address: string }) => {
  let user = await prisma.user.findUnique({
    where: {
      address: address,
    },
  });

  if (!user) {
    // Check if there's an ongoing user creation request for this address
    if (userCreationPromises.has(address)) {
      // If yes, return the existing promise
      return await userCreationPromises.get(address);
    }

    // Otherwise, create a new user and store the promise in the map
    const socials = await fetchSocial(address, "ethereum");
    console.log("new user socials", socials);
    const userCreationPromise = (async () => {
      try {
        user = await prisma.user.create({
          data: {
            address: address,
            ...socials,
          },
        });
      } catch (e) {
        console.log("findOrCreateUser error", e);
        user = await prisma.user.create({
          data: {
            address: address,
            ...socials,
          },
        });
        // console.log("findOrCreateUser error but still created new user", user);
      } finally {
        // Remove the promise from the map when the request is complete
        userCreationPromises.delete(address);
      }

      return user;
    })();

    userCreationPromises.set(address, userCreationPromise);
    return await userCreationPromise;
  }

  return user;
};
