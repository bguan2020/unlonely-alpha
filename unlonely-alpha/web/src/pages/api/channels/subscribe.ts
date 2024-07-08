import { NextApiRequest, NextApiResponse } from "next";
import { PinataFDK } from "pinata-fdk";
import { gql} from "@apollo/client";
import client from "../libs/apolloClient";
const fdk = new PinataFDK({
  pinata_jwt: process.env.NEXT_PUBLIC_PINATA_JWT as string,
  pinata_gateway: process.env.NEXT_PUBLIC_GATEWAY_URL as string,
});

const UPDATE_CHANNEL_FID_SUBSCRIPTION_MUTATION = gql`
  mutation UpdateChannelFidSubscription($data: UpdateChannelFidSubscriptionInput!) {
    updateChannelFidSubscription(data: $data)
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(400).json({ message: "Invalid Method" });
  }

  try {
    const body = req.body;
    const hostUrl = `http://${req.headers.host}`;
    console.log(body)
    const fid = body.untrustedData.fid;
    console.log(req.query)
    const channelId = req.query.channelId as string;
    console.log("Channel ID:", channelId);
    console.log("ID", fid);

    const { data } = await client.mutate({
        mutation: UPDATE_CHANNEL_FID_SUBSCRIPTION_MUTATION,
        variables: {
          data: {
            fid: Number(fid),
            channelId: Number(channelId),
            isAddingSubscriber: true,
          },
        },
      });
      const message = data.updateChannelFidSubscription;

      const subscriptionMessage =
      message === "FID already subscribed"
        ? "Already subscribed."
        : message === "Added fid to channel"
        ? "Successfully Subscribed!"
        : message;

       



    const frameMetadata = await fdk.getFrameMetadata({
        post_url: `${hostUrl}/`,
      buttons: [
        { label: `${subscriptionMessage}`, action: "post_redirect" },
      ],
      aspect_ratio: "1:1",
      cid: "QmPGVGuJBWfbFSggnGEx6pehsGqXwxGYxxGkTTSwDxncJc",
    });

   

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(frameMetadata);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
