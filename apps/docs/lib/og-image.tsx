import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

async function loadGoogleFont(
  font: string,
  weight: number,
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    // Match any font format Google returns (woff2, opentype, truetype, etc.)
    const resource = css.match(/src: url\((.+?)\) format\('/);
    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status === 200) {
        return await response.arrayBuffer();
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Light-mode only — OG images are static assets and cannot adapt to user theme preferences.
export async function generateOgImage(title: string, category: string) {
  const allText = `Kookie UI${title}${category}hellokookie.com`;
  const interMedium = await loadGoogleFont('Inter', 500, allText);
  const interRegular = await loadGoogleFont('Inter', 400, allText);

  const fonts = [
    ...(interMedium ? [{ name: 'Inter', data: interMedium, weight: 500 as const }] : []),
    ...(interRegular ? [{ name: 'Inter', data: interRegular, weight: 400 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          background: '#fafafa',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: fonts.length > 0 ? 'Inter' : 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: '#a3a3a3',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 500,
              color: '#171717',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: '#a3a3a3',
            }}
          >
            Kookie UI
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 400,
              color: '#d4d4d4',
            }}
          >
            hellokookie.com
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      ...(fonts.length > 0 ? { fonts } : {}),
    }
  );
}
