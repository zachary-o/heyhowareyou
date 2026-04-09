import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#0a0a0f",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ color: "white", fontSize: 72 }}>Rate My Opener</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 32 }}>
        AI-powered dating opener rater
      </p>
    </div>
  );
}