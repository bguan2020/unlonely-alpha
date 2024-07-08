/** @jsxImportSource frog/jsx */

import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { gql } from "@apollo/client";
import client from "../../libs/apolloClient";

const UPDATE_CHANNEL_FID_SUBSCRIPTION_MUTATION = gql`
  mutation UpdateChannelFidSubscription($data: UpdateChannelFidSubscriptionInput!) {
    updateChannelFidSubscription(data: $data)
  }
`;

const app = new Frog({
  assetsPath: "/",
  basePath: "/frame",
  title: "unlonely",
  browserLocation: "/:path",
});

app.frame("channels/:id", async (c) => {
  const { buttonValue } = c;
  const fId = c.frameData?.fid;
  const path = c.initialPath;
  const segments = path.split("/");
  const id = segments[3];
  console.log("Channel : ",id);
  console.log("FID : ",fId);

  const farcasterId = Number(fId);
  const channelId = Number(id);

  if (buttonValue === "subscribe") {
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_CHANNEL_FID_SUBSCRIPTION_MUTATION,
        variables: {
          data: {
            fid: farcasterId,
            channelId: channelId,
            isAddingSubscriber: true,
          },
        },
      });

      const message = data.updateChannelFidSubscription;

      return c.res({
        image: (
          <div
            style={{
              alignItems: "center",
              background: "linear-gradient(to right, #432889, #17101F)",
              backgroundSize: "100% 100%",
              display: "flex",
              flexDirection: "column",
              flexWrap: "nowrap",
              height: "100%",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: 60,
                display: "flex",
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                marginTop: 30,
                padding: "0 120px",
                whiteSpace: "pre-wrap",
              }}
            >
              {message === "FID already subscribed" ? "Already subscribed." : message === "Added fid to channel" ? "Successfully Subscribed!." : message}
            </div>
          </div>
        ),
        intents: [<Button.Reset>Back</Button.Reset>],
      });
    } catch (error) {
      console.error("Subscription error", error);
      return c.res({
        image: (
          <div
            style={{
              alignItems: "center",
              background: "linear-gradient(to right, #432889, #17101F)",
              backgroundSize: "100% 100%",
              display: "flex",
              flexDirection: "column",
              flexWrap: "nowrap",
              height: "100%",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: 60,
                display: "flex",
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                marginTop: 30,
                padding: "0 120px",
                whiteSpace: "pre-wrap",
              }}
            >
              Subscription failed.
            </div>
          </div>
        ),
        intents: [<Button.Reset>Back</Button.Reset>],
      });
    }
  }

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            display: "flex",
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          Subscribe to {channelId}'s live streams.
        </div>
      </div>
    ),
    intents: [<Button value="subscribe">Subscribe</Button>],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
