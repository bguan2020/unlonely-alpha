import axios from "axios";

import { Context } from "../../context";
import { User } from "@prisma/client";
import { lensClient, LENS_GET_DEFAULT_PROFILE } from "../../utils/lens/client";

export const getLeaderboard = (ctx: Context) => {
  return ctx.prisma.user.findMany({
    orderBy: [
      {
        reputation: "desc",
      },
    ],
  });
};

export interface IGetUserInput {
  address: string;
}

export const getUser = async (data: IGetUserInput, ctx: Context) => {
  return ctx.prisma.user.findUnique({
    where: { address: data.address },
  });
};

export const getAllUsers = (ctx: Context) => {
  return ctx.prisma.user.findMany();
};

export const updateAllUsers = async (ctx: Context) => {
  // where FCimageurl is null

  const users = await ctx.prisma.user.findMany({
    where: {
      FCImageUrl: "",
    },
  });
  // for loop through userse
  for (let i = 0; i < users.length; i++) {
    // call the api https://searchcaster.xyz/api/profiles?connected_address=${users[i].address}
    // fetch using axios
    const response = await axios.get(
      `https://searchcaster.xyz/api/profiles?connected_address=${users[i].address}`
    );
    console.log(users[i].address, users[i].username);
    console.log(response);

    // // if data array is not empty
    if (response.data.length > 0) {
      console.log(response.data[0].body);
      // update user with FCImageUrl and isFCUser to true
      await ctx.prisma.user.update({
        where: {
          address: users[i].address,
        },
        data: {
          FCImageUrl: response.data[0].body.avatarUrl,
          isFCUser: true,
        },
      });
      console.log(
        "updated user",
        users[i].address,
        response.data[0].body.avatarUrl
      );
    }
    const { data } = await lensClient.query({
      query: LENS_GET_DEFAULT_PROFILE,
      variables: {
        ethereumAddress: users[i].address,
      },
    });

    if (data && data.defaultProfile) {
      console.log(data.defaultProfile.picture === null);
      try {
        await ctx.prisma.user.update({
          where: {
            address: users[i].address,
          },
          data: {
            lensHandle: data.defaultProfile.handle,
            lensImageUrl:
              data.defaultProfile.picture === null
                ? null
                : data.defaultProfile.picture.original.url,
            isLensUser: true,
          },
        });
        console.log(
          "updated user",
          users[i].address,
          data.defaultProfile.handle,
          data.defaultProfile.picture.original.url
        );
      } catch (e) {
        console.log(e);
      }
    }
  }
};

export interface IUpdateUserNotificationsInput {
  notificationsTokens: string;
  notificationsLive: boolean;
  notificationsNFCs: boolean;
}

export const updateUserNotifications = async (
  data: IUpdateUserNotificationsInput,
  user: User,
  ctx: Context
) => {
  return ctx.prisma.user.update({
    where: {
      address: user.address,
    },
    data: {
      notificationsTokens: data.notificationsTokens,
      notificationsLive: data.notificationsLive,
      notificationsNFCs: data.notificationsNFCs,
    },
  });
};
