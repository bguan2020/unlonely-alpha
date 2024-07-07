/** @jsxImportSource frog/jsx */

import { Button, Frog } from "frog"
import { devtools } from "frog/dev"
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next"
import { serveStatic } from "frog/serve-static"

const app = new Frog({
  assetsPath: "/",
  basePath: "/frame",
  title: "unlonely",
  browserLocation: "/:path"
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

//  to check if Farcaster ID is already subscribed
// async function isSubscribed(farcasterId: any) {
//   const response = await fetch(`/api/subscribers/${farcasterId}`, {
//     method: 'GET',
//   })
//   if (response.ok) {
//     const data = await response.json()
//     return data.subscribed
//   }
//   return false
// }

//  subscribe Farcaster ID
// async function subscribe(farcasterId: any) {
//   const response = await fetch('/api/subscribers', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ farcasterId }),
//   })
//   return response.ok
// }

//  unsubscribe Farcaster ID
let subscribers: any = []
//  to check if Farcaster ID is already subscribed
async function isSubscribed(farcasterId: any) {
  return subscribers.includes(farcasterId)
}

//  to subscribe Farcaster ID
async function subscribe(farcasterId: any) {
  if (!subscribers.includes(farcasterId)) {
    subscribers.push(farcasterId)
    return true
  }
  return false
}

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame("/channel/:id", async(c) => {
  const { buttonValue, inputText, status } = c
  
  const path = c.initialPath
  const segments = path.split("/"); 
const id = segments[3];
console.log(id);
 
  const farcasterId = c.frameData?.fid
  const channelId = id;
  if (buttonValue === "subscribe") {
    const subscribed = await isSubscribed(farcasterId)
    if (subscribed) {
      return c.res({
        image: (
          <div
            style={{

              alignItems: "center",
              background:
                "linear-gradient(to right, #432889, #17101F)",
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
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                marginTop: 30,
                padding: "0 120px",
                whiteSpace: "pre-wrap",
              }}
            >
              Already subscribed to {channelId}.
            </div>
          </div>
        ),
        intents: [
          <Button.Reset>Back</Button.Reset>
        ],
      })
    } else {
      const success = await subscribe(farcasterId)
      return c.res({
        image: (
          <div
            style={{
              alignItems: "center",
              background:
                "linear-gradient(to right, #432889, #17101F)",
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
              {success ? "Successfully subscribed!" : "Subscription failed."}
            </div>
          </div>
        ),
        intents: [
          success && <Button.Reset>Back</Button.Reset>,
        ],
      })
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
          Subscribe to {channelId}'s live streams'.
        </div>
      </div>
    ),
    intents: [
      <Button value="subscribe">Subscribe</Button>
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
