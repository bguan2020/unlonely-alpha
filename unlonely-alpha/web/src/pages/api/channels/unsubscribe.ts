import { NextApiRequest, NextApiResponse } from "next";
import client from "../libs/apolloClient";
import { PinataFDK } from "pinata-fdk";
import { UPDATE_CHANNEL_FID_SUBSCRIPTION_MUTATION } from "./subscribe";

const fdk = new PinataFDK({
    pinata_jwt: process.env.NEXT_PUBLIC_PINATA_JWT as string,
    pinata_gateway: process.env.NEXT_PUBLIC_GATEWAY_URL as string,
  });  

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(400).json({ message: "Invalid Method" });
  }

  try {
    const body = req.body;
    const hostUrl = `http://${req.headers.host}`;
    const fid = body.untrustedData.fid;
    const { channelId, slug } = req.query;

    const { data } = await client.mutate({
      mutation: UPDATE_CHANNEL_FID_SUBSCRIPTION_MUTATION,
      variables: {
        data: {
          fid: Number(fid),
          channelId: Number(channelId),
          isAddingSubscriber: false,
        },
      },
    });

    const message = data.updateChannelFidSubscription;

    const subscriptionMessage =
      message === "Removed fid from channel"

    if (subscriptionMessage) {
        try {
            const frameMetadata = await fdk.getFrameMetadata({
              post_url: `${hostUrl}/channels/`,
              buttons: [
                {
                  label: `go watch ${slug}`,
                  action: "link",
                  target: `${hostUrl}/channels/${slug}`,
                },
              ],
              aspect_ratio: "1:1",
              image: {
                url: `${hostUrl}/api/images/unsubscribed?hostUrl=${hostUrl}`,
            },
            });
            res.status(200).send(frameMetadata);
            } catch (error: any) {
                console.error("unsubscribe error 1", error.message);
                res.status(500).json({ success: false, error: error.message });
              }
    } else {
        console.log(
            "Did not unsubscribe successfully, fallback to second frame metadata"
          );
          try {
        const frameMetadata = await fdk.getFrameMetadata({
          post_url: `${hostUrl}/channels/`,
          buttons: [
            {
              label: `${subscriptionMessage}`,
              action: "link",
              target: "https://warpcast.com/unlonely",
            },
            {
              label: `go watch ${slug}`,
              action: "link",
              target: `${hostUrl}/channels/${slug}`,
            },
          ],
          aspect_ratio: "1:1",
          image: {
            url: `${hostUrl}/images/unlonely-mobile-logo.png`,
          },
        }); 
        res.status(200).send(frameMetadata);
      } catch (error: any) {
        console.error("unsubscribe error 2", error.message);
        res.status(500).json({ success: false, error: error.message });
      }    }
  } catch (error: any) {
    console.error("unsubscribe error 3", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}