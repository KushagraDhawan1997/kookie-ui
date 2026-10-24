import fs from 'fs';
import path from 'path';

/**
 * esbuild drops module directives when it bundles, so a "use client" in a source file never
 * reaches dist. Without it, importing any component from a React Server Component fails when the
 * module loads (`react` has no `createContext` or `useLayoutEffect` under `react-server`).
 *
 * So the build runs twice. The client build covers every component and hook, and stamps
 * "use client" on every entry and every shared chunk. The server-safe build covers the modules a
 * server component imports for their values, not to render: the appearance script string, the
 * prop definitions and the helpers. They get no directive, so a server component reads the real
 * value instead of a client reference.
 */
export const USE_CLIENT_BANNER = '"use client";';

const SERVER_SAFE = [/^src\/hooks\/appearance-script\.ts$/, /^src\/helpers\//, /^src\/props\//];

export const isServerSafe = (file) => SERVER_SAFE.some((pattern) => pattern.test(file));

export function listEntries(root = process.cwd()) {
  const files = fs
    .readdirSync(path.join(root, 'src'), { recursive: true })
    .map((file) => path.posix.join('src', file.split(path.sep).join('/')))
    .filter((file) => /\.tsx?$/.test(file) && !file.endsWith('.d.ts'))
    .sort();
  return {
    client: files.filter((file) => !isServerSafe(file)),
    server: files.filter(isServerSafe),
  };
}

/**
 * Returns the client and server-safe build options. `base` holds what both share (format, outdir,
 * externals and so on). `entries` defaults to every source file.
 */
export function buildOptions(base, entries = listEntries(base.absWorkingDir)) {
  const shared = { ...base, outbase: 'src' };
  return [
    { ...shared, entryPoints: entries.client, banner: { js: USE_CLIENT_BANNER } },
    { ...shared, entryPoints: entries.server },
  ].filter((options) => options.entryPoints.length > 0);
}
