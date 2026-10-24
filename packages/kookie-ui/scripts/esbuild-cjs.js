import esbuild from 'esbuild';
import pkg from '../package.json' with { type: 'json' };
import { buildOptions } from './esbuild-shared.js';

const dir = 'dist/cjs';

// Mark all dependencies and peer dependencies as external to prevent bundling
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

/** @type {import('esbuild').BuildOptions} */
const base = {
  outdir: dir,
  format: 'cjs',
  target: 'es2020',
  sourcemap: true,
  minify: true,
  bundle: true,
  external,
};

// Two builds: components and hooks with "use client", and the server-safe modules without it.
const builds = buildOptions(base);

// Check if "watch=true" flag is passed
if (process.argv[2]) {
  const [key, value] = process.argv[2].split('=');
  if (key === 'watch' && value === 'true') {
    for (const options of builds) {
      const ctx = await esbuild.context(options);
      await ctx.watch();
    }
  }
}

Promise.all(builds.map((options) => esbuild.build(options))).catch(() => process.exit(1));
