import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { CHANNEL_ID_NOTIFICATIONS_BLACKLIST } from "./sendPWANotifications";

const prisma = new PrismaClient();

export const directCastFc = async (
  streamId: string,
  messageTemplate: (title: string, slug: string) => string
) => {
  const apiKey = String(process.env.FC_API_KEY);
  if (!apiKey) {
    console.error("FC_API_KEY is not set");
    return;
  }
  const url = "https://api.warpcast.com/v2/ext-send-direct-cast";

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
      "Direct casts already sent within the last hour for channel:",
      existingChannel.slug
    );
    return;
  }

  const promises = existingChannel.subscribedFIDs.map((recipientFid) => {
    const idempotencyKey = uuidv4(); // Generate a unique idempotency key for each request
    return axios
      .put(
        url,
        {
          recipientFid,
          message: messageTemplate(existingChannel.name, existingChannel.slug),
          idempotencyKey,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log(`Direct cast sent to ${recipientFid}: ${response.data}`);
        return response.data;
      })
      .catch((error) => {
        console.error(`Failed to send direct cast to ${recipientFid}:`, error);
        throw new Error(`Failed to send direct cast to ${recipientFid}`);
      });
  });

  try {
    const results = await Promise.allSettled(promises);
    return results;
  } catch (error) {
    console.error("Error sending one or more direct casts:", error);
    throw error;
  }
};
