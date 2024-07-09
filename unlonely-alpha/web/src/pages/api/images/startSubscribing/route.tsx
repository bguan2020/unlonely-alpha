import { ImageResponse } from "next/og";
import { NextApiRequest, NextApiResponse } from "next";

export const runtime = "edge";

export async function GET(
  _req: NextApiRequest,
  {
    params: { slug, title, hostUrl },
  }: {
    params: { slug: string; title: string; hostUrl: string };
  },
  res: NextApiResponse
) {
  const imageRes = new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          backgroundSize: "100% 100%",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <img
          src={`${hostUrl}/images/unlonely-frame-background.png`}
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            position: "relative",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 36,
            padding: 20,
            position: "absolute",
            gap: 20,
            color: "white",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
            width: "100%",
            height: "100vh",
            alignItems: "stretch",
          }}
        >
          <div style={{ display: "flex" }}>
            subscribe to {slug}'s channel to get notified when they go live
          </div>
          <div style={{ display: "flex" }}>{title}</div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 420,
    }
  );

  res.setHeader("Content-Type", "image/png");
  res.send(imageRes);
}
