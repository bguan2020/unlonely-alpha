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
  ctx: Context,
  user: User
) => {
  return await ctx.prisma.subscription.create({
    data: {
      user: {
        connect: {
          address: user.address,
        },
      },
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

  const promises = subscriptions.map((subscription) => {
    const pushSubscription = toPushSubscription(subscription);
    return webpush.sendNotification(pushSubscription, "test")
      .then(() => true) // Successfully sent
      .catch(error => {
        console.error("Failed to send notification:", error);
        return false; // Failed to send
      });
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
