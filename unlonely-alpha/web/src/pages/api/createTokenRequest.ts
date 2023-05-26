import Ably from "ably/promises";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new Ably.Realtime.Promise({ key: process.env.ABLY_API_KEY });
  const cookie = req.headers.cookie;

  let clientId = "unlonely-cookie" as string;

  if (cookie) {
    // Parse the cookies into an object
    const cookies = cookie
      .split(";")
      .reduce((res: Record<string, string>, item) => {
        const data = item.trim().split("=");
        return { ...res, [data[0]]: data[1] };
      }, {});

    // Extract unlonelyAddress value
    const unlonelyAddress = cookies["unlonelyAddress"];
    clientId = unlonelyAddress || clientId;
  }

  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: clientId,
  });

  res.status(200).json(tokenRequestData);
}
