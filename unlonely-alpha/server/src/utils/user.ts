import { PrismaClient } from "@prisma/client";

import { getEnsName } from "./ens";
import { lensClient, LENS_GET_DEFAULT_PROFILE } from "./lens/client";

const prisma = new PrismaClient();

// Create a map to store ongoing user creation requests
const userCreationPromises = new Map();

export const findOrCreateUser = async ({ address }: { address: string }) => {
  console.log("1. address in", address);
  let user = await prisma.user.findUnique({
    where: {
      address: address,
    },
  });
  console.log("2. find existing user", user)

  if (!user) {
    console.log("2a. no user found");
    // Check if there's an ongoing user creation request for this address
    if (userCreationPromises.has(address)) {
      console.log("ongoing user create req")
      // If yes, return the existing promise
      return await userCreationPromises.get(address);
    }

    // Otherwise, create a new user and store the promise in the map
    const username = await getEnsName(address);
    const userCreationPromise = (async () => {
      try {
        const { data } = await lensClient.query({
          query: LENS_GET_DEFAULT_PROFILE,
          variables: {
            ethereumAddress: address,
          },
        });
        console.log(data, "lens data");

        if (data && data.defaultProfile) {
          user = await prisma.user.create({
            data: {
              address: address,
              username: username,
              lensHandle: data.defaultProfile.handle,
              lensImageUrl:
                data.defaultProfile.picture === null
                  ? null
                  : data.defaultProfile.picture.original.url,
              isLensUser: true,
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              address: address,
              username: username,
            },
          });
        }
      } catch (e) {
        console.log(e);
        user = await prisma.user.create({
          data: {
            address: address,
            username: username,
          },
        });
        console.log("error but still created new user", user);
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
