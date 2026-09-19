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
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Transpile the local kookie-ui package
  transpilePackages: ['@kushagradhawan/kookie-ui'],
  // Expose kookie-ui version to the client
  env: {
    KOOKIE_UI_VERSION: packageJson.version,
  },
  // The theme pages became chapters on 2026-09-19 (docs/LOG.md). Old links keep working.
  async redirects() {
    return [
      ['/docs/installation', '/start/installation'],
      ['/docs/theme', '/start/theming'],
      ['/docs/colors', '/foundations/color'],
      ['/docs/typography', '/foundations/typography'],
      ['/docs/radius', '/foundations/radius'],
      ['/docs/material', '/foundations/materials'],
      ['/docs/shadows', '/foundations/depth'],
      ['/docs/constants', '/foundations/constants'],
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
