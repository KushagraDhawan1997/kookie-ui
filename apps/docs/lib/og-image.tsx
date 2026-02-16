import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

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
  throw new Error('Failed to load font');
}

export async function generateOgImage(title: string, category: string) {
  const allText = `Kookie UI${title}${category}`;
  const interMedium = await loadGoogleFont('Inter', 500, allText);
  const interRegular = await loadGoogleFont('Inter', 400, allText);

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
          fontFamily: 'Inter',
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
      fonts: [
        { name: 'Inter', data: interMedium, weight: 500 },
        { name: 'Inter', data: interRegular, weight: 400 },
      ],
    }
  );
}
