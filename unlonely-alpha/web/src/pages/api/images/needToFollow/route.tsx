import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(_req: NextRequest) {
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
        <div
          style={{
            color: "white",
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            width: "100%",
            height: "100vh",
          }}
        >
          <img
            src={"https://www.unlonely.app/images/unlonely-frame-background"}
            style={{
              height: "100%",
              width: "100%",
              objectFit: "cover",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 36,
                padding: 20,
                position: "absolute",
                gap: 20,
              }}
            >
              <div style={{ display: "flex" }}>
                you need to follow @unlonely first so we can notify you!
              </div>
              <div style={{ display: "flex" }}>
                follow, wait a few seconds, then click subscribe again
              </div>
              <div style={{ display: "flex" }}>this may take a few tries</div>
            </div>
          </img>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 420,
    }
  );
}
