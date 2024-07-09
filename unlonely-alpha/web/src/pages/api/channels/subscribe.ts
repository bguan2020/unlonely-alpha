import { NextApiRequest, NextApiResponse } from "next";
import { PinataFDK } from "pinata-fdk";
import { gql} from "@apollo/client";
import client from "../libs/apolloClient";
import { isFollowing } from "../libs/verifyFollow";

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
    // const channelId = req.query.channelId as string;
    // const slug = req.query.slug;
    const { channelId, slug } = req.query;
    console.log("Channel ID:", channelId, "Slug:", slug);
    console.log("ID", fid);
    const unlonelyFID = 1225;

    const isFollowingUnlonely = await isFollowing(Number(fid), unlonelyFID);

    if (!isFollowingUnlonely) {
        const frameMetadata = await fdk.getFrameMetadata({
          post_url: `${hostUrl}/channels/`,
          buttons: [
            { label: "Subscribe", action: "post", target: `${hostUrl}/api/channels/subscribe?channelId=${channelId}` },
            {label: "Follow @unlonely to subscribe ", action: "link", target: "https://warpcast.com/unlonely"},
            
          ],
          aspect_ratio: "1:1",
          image: {
            url: `${hostUrl}/images/follow-prompt.png`,
          }
        });
  
        res.status(200).send(frameMetadata);
        return;
      }
  

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


        if(subscriptionMessage === "Successfully Subscribed!"){
            const frameMetadata = await fdk.getFrameMetadata({
              post_url: `${hostUrl}/channels/`,
              buttons: [
                { label: `${subscriptionMessage}`, action: "link" },
              ],
              aspect_ratio: "1:1",
              image: {
                url: `${hostUrl}/images/subscribe-message.png`,
              }
             
            });
            res.status(200).send(frameMetadata);
        }
       



    const frameMetadata = await fdk.getFrameMetadata({
        post_url: `${hostUrl}/channels/`,
      buttons: [
        { label: `${subscriptionMessage}`, action: "link" },
      ],
      aspect_ratio: "1:1",
      image: {
        url: `${hostUrl}/images/unlonely-mobile-logo.png`,
      }
     
    });

    

   

    
    res.status(200).send(frameMetadata);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
