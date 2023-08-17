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
      const result = await webpush.sendNotification(pushSubscription, '{"notification": {"title": "my title","body": "my body"}}'
      );
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
