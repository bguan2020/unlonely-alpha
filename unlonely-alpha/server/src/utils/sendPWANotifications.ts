import { PrismaClient } from "@prisma/client";
import webpush from "web-push";
import { toPushSubscription } from "../entities/Subscription/SubscriptionService";

export const CHANNEL_ID_NOTIFICATIONS_BLACKLIST: number[] = [29];

const prisma = new PrismaClient();

export const sendPWANotifications = async (streamId: string) => {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_MAILTO}`,
    vapidPublicKey,
    vapidPrivateKey
  );

  const existingChannel = await prisma.channel.findFirst({
    where: {
      livepeerStreamId: streamId,
    },
  });

  if (!existingChannel) {
    console.error("Channel not found for livepeer stream id", streamId);
    return;
  }

  if (CHANNEL_ID_NOTIFICATIONS_BLACKLIST.includes(existingChannel.id)) return;

  const oneHourAgo = new Date(Date.now() - 3600 * 1000);

  if (existingChannel.lastNotificationAt > oneHourAgo) {
    console.log(
      "Notification already sent within the last hour for channel:",
      existingChannel.slug
    );
    return;
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      softDelete: false,
    },
  });

  const promises = subscriptions.map(async (subscription) => {
    const pushSubscription = toPushSubscription(subscription);
    try {
      const notificationPayload = {
        notification: {
          title: `${existingChannel.slug} is live!`,
          body: existingChannel.name,
          data: {
            url: `/channels/${existingChannel.slug}`,
          },
        },
      };
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(notificationPayload)
      );
      return true; // Successfully sent
    } catch (error: any) {
      if (error.statusCode === 410) {
        // Subscription is no longer valid, remove from database
        await prisma.subscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            softDelete: true,
          },
        });
      }
      console.error("Failed to send notification:", error);
      return false; // Failed to send
    }
  });

  const results = await Promise.allSettled(promises);
  const successfulNotifications = results.filter(
    (result) => result.status === "fulfilled" && result.value === true
  );
  if (successfulNotifications.length > 0) {
    await prisma.channel.update({
      where: {
        id: existingChannel.id,
      },
      data: {
        lastNotificationAt: new Date(Date.now()),
      },
    });
  }
};
