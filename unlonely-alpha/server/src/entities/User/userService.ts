import { Context } from "../../context";
import axios from "axios";
import { User } from "@prisma/client";

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

export const getAllUsers = async (ctx: Context) => {
  // where FCimageurl is null

  const users = await ctx.prisma.user.findMany();
  // for loop through userse
  for (let i = 0; i < users.length; i++) {
    // call the api https://searchcaster.xyz/api/profiles?connected_address=${users[i].address}
    // fetch using axios
    const response = await axios.get(
      `https://searchcaster.xyz/api/profiles?connected_address=${users[i].address}`
    );

    // if data array is not empty
    if (response.data.length > 0) {
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
