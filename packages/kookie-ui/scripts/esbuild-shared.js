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
 * A server-safe module may re-export client code (`helpers/index.ts` re-exports the theme-size
 * context and hooks). Bundling that code into the server-safe output would call `createContext` in
 * a server component and give the client a second context. So the server-safe build keeps every
 * relative import of a client module external: the output imports the client build's file at the
 * same relative path, which carries "use client".
 */
function externalClientModules(root) {
  return {
    name: 'external-client-modules',
    setup(build) {
      build.onResolve({ filter: /^\.\.?\// }, (args) => {
        const target = path.resolve(args.resolveDir, args.path);
        const stem = target.replace(/\.js$/, '');
        const source = ['.ts', '.tsx'].map((ext) => stem + ext).find((file) => fs.existsSync(file));
        if (!source) return undefined;
        const file = path.posix.join(...path.relative(root, source).split(path.sep));
        if (!file.startsWith('src/') || isServerSafe(file)) return undefined;
        return { path: args.path.endsWith('.js') ? args.path : `${args.path}.js`, external: true };
      });
    },
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
    {
      ...shared,
      entryPoints: entries.server,
      plugins: [...(base.plugins ?? []), externalClientModules(base.absWorkingDir ?? process.cwd())],
    },
  ].filter((options) => options.entryPoints.length > 0);
}
