import { ImageResponse } from "@vercel/og";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const title = searchParams.get("title");
  const hostUrl = searchParams.get("hostUrl");

  if (!slug || !title || !hostUrl) {
    return new Response("Missing required parameters", { status: 400 });
  }

  const imageResponse = new ImageResponse(
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
        }}
      >
        <img
          src={`${hostUrl}/images/unlonely-frame-background.png`}
          style={{
            height: "100%",
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
            color: "white",
            whiteSpace: "pre-wrap",
            width: "100%",
            height: "100vh",
          }}
        >
          <h4 style={{ textAlign: "center" }}>
            subscribe to {slug}'s channel to get notified when they go live
          </h4>
          <h4 style={{ textAlign: "center" }}>{title}</h4>
        </div>
      </div>
    ),
    {
      width: 520,
      height: 516,
    }
  );

  return new NextResponse(imageResponse.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, stale-while-revalidate=59",
    },
  });
}
