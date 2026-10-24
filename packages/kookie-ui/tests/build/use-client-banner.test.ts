// @vitest-environment node
import fs from 'fs';
import os from 'os';
import path from 'path';
import esbuild from 'esbuild';
import { afterAll, describe, expect, it } from 'vitest';
// @ts-expect-error plain JS build script, no types
import { buildOptions, listEntries } from '../../scripts/esbuild-shared.js';

/**
 * esbuild drops module directives when it bundles, so without a banner no file in dist carries
 * "use client" and a React Server Component that imports any component fails at load. This runs
 * the real build options on two entries into a temp dir.
 */
const root = path.resolve(__dirname, '../..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'kookie-use-client-'));
afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

const firstLine = (file: string) => fs.readFileSync(file, 'utf8').split('\n')[0]!;

describe('built output directives', () => {
  it('splits entries into client and server-safe', () => {
    const { client, server } = listEntries(root);
    expect(client).toContain('src/components/box.tsx');
    expect(client).toContain('src/index.ts');
    expect(server).toContain('src/hooks/appearance-script.ts');
    expect(server).toContain('src/props/index.ts');
    expect(client.some((file: string) => server.includes(file))).toBe(false);
  });

  it('stamps "use client" on every client entry and chunk, and leaves the appearance script server-safe', async () => {
    const base = {
      absWorkingDir: root,
      outdir: out,
      format: 'esm' as const,
      target: 'es2020',
      minify: true,
      bundle: true,
      splitting: true,
      write: true,
      logLevel: 'silent' as const,
      external: ['react', 'react-dom', 'radix-ui', 'classnames', '@radix-ui/*', 'motion', 'motion/*'],
    };
    const builds = buildOptions(base, {
      client: ['src/components/box.tsx', 'src/components/flex.tsx'],
      server: ['src/hooks/appearance-script.ts'],
    });
    for (const options of builds) await esbuild.build(options);

    const files = fs.readdirSync(out, { recursive: true }).map(String).filter((file) => file.endsWith('.js'));
    const clientFiles = files.filter((file) => !file.includes('appearance-script'));
    expect(clientFiles.some((file) => file.startsWith('chunk-'))).toBe(true);
    for (const file of clientFiles) expect(firstLine(path.join(out, file)).startsWith('"use client";')).toBe(true);
    expect(fs.readFileSync(path.join(out, 'hooks/appearance-script.js'), 'utf8')).not.toContain('use client');
  });
});
