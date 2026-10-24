// @vitest-environment node
import path from 'path';
import esbuild from 'esbuild';
import { describe, expect, it } from 'vitest';

/**
 * What one import ships. Each entry is bundled on its own, and the bytes each input adds to the
 * output tell which libraries came with it. Inputs esbuild only read and shook out count as none.
 */
const root = path.resolve(__dirname, '../..');

async function inputsOf(source: string) {
  const result = await esbuild.build({
    absWorkingDir: root,
    stdin: { contents: source, resolveDir: root, loader: 'ts' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    metafile: true,
    logLevel: 'silent',
    loader: { '.css': 'empty' },
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  const [output] = Object.values(result.metafile!.outputs);
  return Object.entries(output!.inputs)
    .filter(([, input]) => input.bytesInOutput > 0)
    .map(([file]) => file);
}

const has = (inputs: string[], pattern: RegExp) => inputs.some((input) => pattern.test(input));

describe('bundle isolation', () => {
  it('DropdownMenu does not bring the virtualizer', async () => {
    const inputs = await inputsOf("import * as DropdownMenu from './src/components/dropdown-menu'; console.log(DropdownMenu);");
    expect(has(inputs, /@tanstack\/virtual-core/)).toBe(false);
    expect(has(inputs, /virtual-menu/)).toBe(false);
  });

  it('ContextMenu does not bring the virtualizer', async () => {
    const inputs = await inputsOf("import * as ContextMenu from './src/components/context-menu'; console.log(ContextMenu);");
    expect(has(inputs, /@tanstack\/virtual-core/)).toBe(false);
    expect(has(inputs, /virtual-menu/)).toBe(false);
  });

  it('VirtualMenu still brings it', async () => {
    const inputs = await inputsOf("import { VirtualMenu } from './src/components/virtual-menu'; console.log(VirtualMenu);");
    expect(has(inputs, /@tanstack\/virtual-core/)).toBe(true);
  });

  it('Theme does not bring Radix Tooltip', async () => {
    const inputs = await inputsOf("import { Theme } from './src/components/theme'; console.log(Theme);");
    expect(has(inputs, /react-tooltip/)).toBe(false);
  });

  it('Tooltip brings Radix Tooltip itself', async () => {
    const inputs = await inputsOf("import { Tooltip } from './src/components/tooltip'; console.log(Tooltip);");
    expect(has(inputs, /react-tooltip/)).toBe(true);
  });
});

describe('menu namespaces', () => {
  it('have no Virtual part', async () => {
    const DropdownMenu = await import('../../src/components/dropdown-menu');
    const ContextMenu = await import('../../src/components/context-menu');
    expect('Virtual' in DropdownMenu).toBe(false);
    expect('Virtual' in ContextMenu).toBe(false);
  });
});
