import { ImageResponse } from "next/og";

export const alt = "Womp Design System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(font: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }
  throw new Error("Failed to load font");
}

export default async function Image() {
  const title = "Womp Design";
  const subtitle = "Built on Kookie UI v1";
  const text = title + subtitle;

  const interMedium = await loadGoogleFont("Inter", 500, text);
  const interRegular = await loadGoogleFont("Inter", 400, text);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#fafafa",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 500,
            color: "#171717",
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "#737373",
          }}
        >
          Built on Kookie UI v1
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interMedium, weight: 500 },
        { name: "Inter", data: interRegular, weight: 400 },
      ],
    }
  );
}
