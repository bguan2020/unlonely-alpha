import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const directCastFc = async (streamId: string, messageTemplate: (slug: string) => string) => {
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

  const promises = existingChannel.subscribedFIDs.map(recipientFid => {
    const idempotencyKey = uuidv4();  // Generate a unique idempotency key for each request
    return axios.put(url, {
      recipientFid,
      message: messageTemplate(existingChannel.slug),
      idempotencyKey
    }, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      console.log(`Direct cast sent to ${recipientFid}: ${response.data}`);
      return response.data;
    })
    .catch(error => {
      console.error(`Failed to send direct cast to ${recipientFid}:`, error);
      throw new Error(`Failed to send direct cast to ${recipientFid}`);
    });
  });

  try {
    const results = await Promise.allSettled(promises);
    results.forEach(result => {
      if (result.status === "fulfilled") {
        console.log("Direct cast sent successfully");
      } else {
        console.error("Failed to send direct cast");
      }
    });
    return results;
  } catch (error) {
    console.error("Error sending one or more direct casts:", error);
    throw error;
  }
}