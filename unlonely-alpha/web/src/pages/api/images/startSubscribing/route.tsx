import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const title = searchParams.get("title");
  const hostUrl = searchParams.get("hostUrl");

  return new ImageResponse(
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
}
