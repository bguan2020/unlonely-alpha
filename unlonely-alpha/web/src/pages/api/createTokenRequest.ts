import Ably from "ably/promises";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const client = new Ably.Realtime(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: req.query.rnd as string,
  });

  res.status(200).json(tokenRequestData);
}
