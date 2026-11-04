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
 * the real build options into temp dirs, on a few entries and on every entry.
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

    const files = fs
      .readdirSync(out, { recursive: true })
      .map(String)
      .filter((file) => file.endsWith('.js'));
    const clientFiles = files.filter((file) => !file.includes('appearance-script'));
    expect(clientFiles.some((file) => file.startsWith('chunk-'))).toBe(true);
    for (const file of clientFiles) expect(firstLine(path.join(out, file)).startsWith('"use client";')).toBe(true);
    expect(fs.readFileSync(path.join(out, 'hooks/appearance-script.js'), 'utf8')).not.toContain('use client');
  });

  it('keeps the helpers entry server-safe and points it at the one client theme-size module', async () => {
    const helpersOut = fs.mkdtempSync(path.join(os.tmpdir(), 'kookie-helpers-'));
    try {
      const base = {
        absWorkingDir: root,
        outdir: helpersOut,
        format: 'esm' as const,
        target: 'es2020',
        bundle: true,
        splitting: true,
        write: true,
        logLevel: 'silent' as const,
        external: ['react', 'react-dom', 'radix-ui', 'classnames', '@radix-ui/*', 'motion', 'motion/*'],
      };
      const { client } = listEntries(root);
      expect(client).toContain('src/hooks/theme-size.ts');
      const builds = buildOptions(base, { client: ['src/hooks/theme-size.ts'], server: ['src/helpers/index.ts'] });
      for (const options of builds) await esbuild.build(options);

      const helpers = fs.readFileSync(path.join(helpersOut, 'helpers/index.js'), 'utf8');
      // A server component must be able to load /helpers, so it never calls createContext itself.
      expect(helpers).not.toContain('use client');
      expect(helpers).not.toContain('createContext');
      // It re-exports the context from the client module, so /helpers and the components share it.
      expect(helpers).toMatch(/from\s*["']\.\.\/hooks\/theme-size\.js["']/);
      expect(firstLine(path.join(helpersOut, 'hooks/theme-size.js')).startsWith('"use client";')).toBe(true);
    } finally {
      fs.rmSync(helpersOut, { recursive: true, force: true });
    }
  });

  /**
   * Builds every entry with the real options for one format, then follows each relative import
   * from a server-safe entry. Each must resolve to a built file, and none may reach a "use client"
   * file except the theme-size hooks that `/helpers` re-exports on purpose.
   */
  const CLIENT_BOUNDARIES = new Set(['hooks/theme-size.js']);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const external = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})];
  const importPattern = /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"']+)["']/g;

  async function walkServerEntries(format: 'esm' | 'cjs') {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `kookie-server-safe-${format}-`));
    try {
      const base = {
        absWorkingDir: root,
        outdir: dir,
        format,
        target: 'es2020',
        minify: true,
        bundle: true,
        ...(format === 'esm' ? { splitting: true } : {}),
        write: true,
        logLevel: 'silent' as const,
        external,
      };
      await Promise.all(buildOptions(base).map((options: object) => esbuild.build(options)));

      const broken: string[] = [];
      const clientReached: string[] = [];
      const boundaries = new Set<string>();
      const bareImports = new Set<string>();
      const seen = new Set<string>();
      const queue = ['props/index.js', 'helpers/index.js'];
      while (queue.length > 0) {
        const file = queue.shift()!;
        if (seen.has(file)) continue;
        seen.add(file);
        const code = fs.readFileSync(path.join(dir, file), 'utf8');
        for (const [, specifier] of code.matchAll(importPattern)) {
          if (!specifier!.startsWith('.')) {
            bareImports.add(specifier!);
            continue;
          }
          const target = path.posix.join(path.posix.dirname(file), specifier!);
          if (!fs.existsSync(path.join(dir, target))) {
            broken.push(`${file} -> ${specifier}`);
            continue;
          }
          if (firstLine(path.join(dir, target)).startsWith('"use client";')) {
            if (CLIENT_BOUNDARIES.has(target)) boundaries.add(target);
            else clientReached.push(`${file} -> ${target}`);
            continue;
          }
          queue.push(target);
        }
      }
      return { broken, clientReached, bareImports: [...bareImports], boundaries: [...boundaries] };
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  const isExternal = (specifier: string) => external.some((name) => specifier === name || specifier.startsWith(`${name}/`));

  it.each(['esm', 'cjs'] as const)(
    'keeps /props and /helpers server-safe in the full %s build',
    async (format) => {
      const { broken, clientReached, bareImports, boundaries } = await walkServerEntries(format);
      // The walk really followed the output: /helpers reaches the theme-size hooks it re-exports.
      expect(boundaries).toEqual(['hooks/theme-size.js']);
      expect(broken).toEqual([]);
      expect(clientReached).toEqual([]);
      expect(bareImports.filter((specifier) => !isExternal(specifier))).toEqual([]);
    },
    60_000,
  );

  it('treats component prop files as server-safe', () => {
    const { server } = listEntries(root);
    expect(server).toContain('src/components/heading.props.tsx');
    expect(server).toContain('src/components/_internal/base-tab-list.props.ts');
    expect(server).not.toContain('src/components/heading.tsx');
  });
});
