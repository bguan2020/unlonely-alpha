import { Subscription } from "@prisma/client";
import webpush from "web-push";

import { Context } from "../../context";
import { suggestedChannels } from "../../utils/suggestedChannels";

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
      allowedChannels: suggestedChannels,
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

export interface IMoveChannelAlongSubscriptionInput {
  endpoint: string;
  channelId: number;
}

export interface IGetSubscriptionsByChannelIdInput {
  channelId: number;
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
export const getSubscriptionByEndpoint = async (
  data: IToggleSubscriptionInput,
  ctx: Context
) => {
  return await ctx.prisma.subscription.findFirst({
    where: {
      endpoint: data.endpoint,
    },
  });
};

export const addChannelToSubscription = async (
  data: IMoveChannelAlongSubscriptionInput,
  ctx: Context
) => {
  const existingSubscription = await ctx.prisma.subscription.findFirst({
    where: {
      endpoint: data.endpoint,
    },
  });

  if (!existingSubscription) {
    throw new Error("Subscription does not exist");
  }

  if (existingSubscription.allowedChannels.includes(Number(data.channelId))) {
    return existingSubscription;
  } else {
    const updatedChannels = [
      ...existingSubscription.allowedChannels,
      Number(data.channelId),
    ];
    return await ctx.prisma.subscription.update({
      where: {
        id: existingSubscription.id,
      },
      data: {
        allowedChannels: updatedChannels,
      },
    });
  }
};

export const removeChannelFromSubscription = async (
  data: IMoveChannelAlongSubscriptionInput,
  ctx: Context
) => {
  const existingSubscription = await ctx.prisma.subscription.findFirst({
    where: {
      endpoint: data.endpoint,
    },
  });

  if (!existingSubscription) {
    throw new Error("Subscription does not exist");
  }

  if (!existingSubscription.allowedChannels.includes(Number(data.channelId))) {
    return existingSubscription;
  } else {
    const updatedChannels = existingSubscription.allowedChannels.filter(
      (id) => Number(id) !== Number(data.channelId)
    );

    return await ctx.prisma.subscription.update({
      where: {
        id: existingSubscription.id,
      },
      data: {
        allowedChannels: updatedChannels,
      },
    });
  }
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

export const getSubscriptionsByChannelId = async (
  ctx: Context,
  data: IGetSubscriptionsByChannelIdInput
) => {
  const channelId =
    typeof data.channelId === "string"
      ? Number(data.channelId)
      : data.channelId;

  return await findSubscriptionsByChannelId(ctx, channelId);
};

export interface ISendAllNotificationsInput {
  title: string;
  body: string;
  pathname?: string;
  channelId?: number;
}

export interface IAddSuggestedChannelsToSubscriptionsInput {
  channelIds: number[];
}

export const addSuggestedChannelsToSubscriptions = async (
  ctx: Context,
  data: IAddSuggestedChannelsToSubscriptionsInput
): Promise<Subscription[]> => {
  const subscriptions = await ctx.prisma.subscription.findMany();

  // Collect all the promises for updating subscriptions
  const updatePromises: Promise<Subscription>[] = [];

  const channelIds = data.channelIds.map((channelId) => Number(channelId));

  subscriptions.forEach((subscription) => {
    const updatedChannels: number[] = [...subscription.allowedChannels];

    // Add each channelId from the input, if it's not already in the allowedChannels
    channelIds.forEach((channelId) => {
      if (!updatedChannels.includes(Number(channelId))) {
        updatedChannels.push(Number(channelId));
      }
    });

    // Update the subscription with the new set of allowed channels
    const updatePromise = ctx.prisma.subscription.update({
      where: { id: subscription.id },
      data: { allowedChannels: updatedChannels },
    });

    updatePromises.push(updatePromise);
  });

  // Run all the update promises in parallel and wait for them to complete
  return await Promise.all(updatePromises);
};

export const sendAllNotifications = async (
  ctx: Context,
  data: ISendAllNotificationsInput
) => {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_MAILTO}`,
    vapidPublicKey,
    vapidPrivateKey
  );

  const subscriptions =
    data.channelId === undefined || data.channelId === null
      ? await ctx.prisma.subscription.findMany({
          where: {
            softDelete: false,
          },
        })
      : await findSubscriptionsByChannelId(
          ctx,
          typeof data.channelId === "string"
            ? Number(data.channelId)
            : data.channelId
        );

  const promises = subscriptions.map(async (subscription) => {
    const pushSubscription = toPushSubscription(subscription);
    try {
      const notificationPayload = {
        notification: {
          title: data.title,
          body: data.body,
          data: {
            url: data.pathname ? data.pathname : "/",
          },
        },
      };
      const result = await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(notificationPayload)
      );
      return true; // Successfully sent
    } catch (error: any) {
      if (error.statusCode === 410) {
        // Subscription is no longer valid, remove from database
        await ctx.prisma.subscription.update({
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

  const results = await Promise.all(promises);
  return results.every((result) => result === true);
};

export function toPushSubscription(subscription: Subscription): any {
  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };
}

async function findSubscriptionsByChannelId(
  ctx: Context,
  channelId: number
): Promise<Subscription[]> {
  const subscriptions = await ctx.prisma.subscription.findMany({
    where: {
      softDelete: false,
      allowedChannels: {
        has: channelId,
      },
    },
  });
  return subscriptions;
}
