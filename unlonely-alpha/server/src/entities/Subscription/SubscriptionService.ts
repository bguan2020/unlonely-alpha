import { Subscription, User } from "@prisma/client";
import webpush from "web-push";

import { Context } from "../../context";

export interface IPostSubscriptionInput {
  endpoint: string;
  expirationTime?: Date;
  p256dh: string;
  auth: string;
}

export interface ISoftDeleteSubscriptionInput {
  id: number;
}

export const postSubscription = async (
  data: IPostSubscriptionInput,
  ctx: Context
) => {
  // first check if subscritpion already exists using endpoint
  // if it does, update it so that it is not soft deleted
  // if it does not, create it
  const existingSubscription = await ctx.prisma.subscription.findFirst({
    where: {
      endpoint: data.endpoint,
    },
  });

  if (existingSubscription) {
    return await ctx.prisma.subscription.update({
      where: {
        id: existingSubscription.id,
      },
      data: {
        softDelete: false,
      },
    });
  }

  return await ctx.prisma.subscription.create({
    data: {
      endpoint: data.endpoint,
      expirationTime: data.expirationTime,
      p256dh: data.p256dh,
      auth: data.auth,
    },
  });
};

export const softDeleteSubscription = async (
  data: ISoftDeleteSubscriptionInput,
  ctx: Context
) => {
  return await ctx.prisma.subscription.update({
    where: {
      id: data.id,
    },
    data: {
      softDelete: true,
    },
  });
};
export interface IToggleSubscriptionInput {
  endpoint: string;
}

export const toggleSubscription = async (
  data: IToggleSubscriptionInput,
  ctx: Context
) => {
  // toggle subscription.softDelete
  const existingSubscription = await ctx.prisma.subscription.findFirst({
    where: {
      endpoint: data.endpoint,
    },
  });

  if (!existingSubscription) {
    throw new Error("Subscription does not exist");
  }

  return await ctx.prisma.subscription.update({
    where: {
      id: existingSubscription.id,
    },
    data: {
      softDelete: !existingSubscription.softDelete,
    },
  });
};

export const checkSubscriptionByEndpoint = async (
  data: IToggleSubscriptionInput,
  ctx: Context
) => {
  // if subscription.softDelete is true, return false
  // if subscription.softDelete is false, return true
  const existingSubscription = await ctx.prisma.subscription.findFirst({
    where: {
      endpoint: data.endpoint,
    },
  });
  
  if (!existingSubscription) {
    throw new Error("Subscription does not exist");
  }

  return !existingSubscription.softDelete;
};

export const getAllActiveSubscriptions = async (ctx: Context) => {
  return await ctx.prisma.subscription.findMany({
    where: {
      softDelete: false,
    },
  });
};

export const sendAllNotifications = async (ctx: Context) => {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
  console.log("vapidPublicKey", vapidPublicKey, "vapidPrivateKey", vapidPrivateKey);

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_MAILTO}`,
    vapidPublicKey,
    vapidPrivateKey
  );
  const subscriptions = await ctx.prisma.subscription.findMany({
    where: {
      softDelete: false,
    },
  });

  const promises = subscriptions.map(async (subscription) => {
    const pushSubscription = toPushSubscription(subscription);
    console.log(pushSubscription);
    try {
      const result = await webpush.sendNotification(pushSubscription, "{'notification': {'title': 'my title','body': 'my body',}}");
      console.log("Successfully sent notification", result);
      return true; // Successfully sent
    } catch (error: any) {
      if (error.statusCode === 410) {
        // Subscription is no longer valid, remove from database
        await ctx.prisma.subscription.update({
          where: {
            id: subscription.id
          },
          data: {
            softDelete: true
          }
        });
      }
      console.error("Failed to send notification:", error);
      return false; // Failed to send
    }
  });
  
  const results = await Promise.all(promises);
  return results.every(result => result === true);
  
};

function toPushSubscription(subscription: Subscription): any {
  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };
}
