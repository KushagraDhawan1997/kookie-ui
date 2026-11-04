import nextMDX from '@next/mdx'
import packageJson from '../../packages/kookie-ui/package.json' with { type: 'json' }

/** @type {import('rehype-pretty-code').Options} */
const rehypePrettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark',
  },
  keepBackground: false, // We'll use our own backgrounds
  grid: true, // Enable grid for full-width line highlighting
  defaultLang: 'plaintext',
  defaultColor: false, // Disable default color to force CSS variables
  // Enable inline code highlighting with {:lang} syntax
  // This will work in MDX: `const x = 1{:js}`
}

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  // Turbopack requires plugins as module names with serializable options
  options: {
    remarkPlugins: [
      'remark-gfm',
      'remark-frontmatter',
    ],
    rehypePlugins: [
      'rehype-slug', // Generates IDs for headings
      ['rehype-pretty-code', rehypePrettyCodeOptions]
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A phone on the same Wi-Fi opens the dev server by the Mac's address while testing touch pages.
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '*.local'],
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Transpile the local kookie-ui package
  transpilePackages: ['@kushagradhawan/kookie-ui'],
  // Expose kookie-ui version to the client
  env: {
    KOOKIE_UI_VERSION: packageJson.version,
  },
  // Old links keep working: every removed or renamed page points to its nearest page.
  async redirects() {
    return [
      // The theme pages became chapters on 2026-09-19 (docs/LOG.md).
      ['/docs/installation', '/start/installation'],
      ['/docs/theme', '/start/theming'],
      ['/docs/colors', '/foundations/color'],
      ['/docs/typography', '/foundations/typography'],
      ['/docs/radius', '/foundations/radius'],
      ['/docs/shadows', '/foundations/depth'],
      ['/docs/constants', '/foundations/constants'],
      // Surfaces are solid since 0.17; material is gone.
      ['/docs/material', '/start/theming'],
      ['/foundations/materials', '/start/theming'],
      // Components merged or removed in 0.15 to 0.22.
      ['/docs/app-bar', '/docs/toolbar'],
      ['/docs/callout', '/docs/notice'],
      ['/docs/badge', '/docs/chip'],
      ['/docs/icon-button', '/docs/button'],
      ['/docs/toggle-button', '/docs/toggle'],
      ['/docs/toggle-icon-button', '/docs/toggle'],
    ].map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default withMDX(nextConfig)
