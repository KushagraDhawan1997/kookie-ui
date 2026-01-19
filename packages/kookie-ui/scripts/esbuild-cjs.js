import esbuild from 'esbuild';
import pkg from '../package.json' with { type: 'json' };

const dir = 'dist/cjs';

// Mark all dependencies and peer dependencies as external to prevent bundling
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ['src/**/*.ts*'],
  outdir: dir,
  format: 'cjs',
  target: 'es2020',
  sourcemap: true,
  minify: true,
  external,
};

// Check if "watch=true" flag is passed
if (process.argv[2]) {
  const [key, value] = process.argv[2].split('=');
  if (key === 'watch' && value === 'true') {
    const ctx = await esbuild.context(options);
    await ctx.watch();
  }
}

esbuild.build(options).catch(() => process.exit(1));
