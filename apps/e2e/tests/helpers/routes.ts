import { execFileSync } from 'node:child_process';

export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:2509';

let cached: string[] | undefined;

/**
 * Every route listed in the docs sitemap. Read synchronously so each route
 * can become its own test at collection time.
 */
export function getRoutes(): string[] {
  if (cached) return cached;
  let xml: string;
  try {
    xml = execFileSync('curl', ['-sf', `${BASE_URL}/sitemap.xml`], { encoding: 'utf8' });
  } catch {
    throw new Error(`Docs server not reachable at ${BASE_URL}. Start it with \`pnpm docs\`.`);
  }
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  cached = [...new Set(paths)];
  return cached;
}
