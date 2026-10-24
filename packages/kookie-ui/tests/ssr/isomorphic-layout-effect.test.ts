// @vitest-environment node
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

/**
 * React 18's server renderer warns on every raw `useLayoutEffect`, once per component per
 * request. These modules render on the server, so they use radix-ui/internal's isomorphic
 * `useLayoutEffect` (a no-op on the server) instead of React's or a local copy of it.
 */
const src = path.resolve(__dirname, '../../src/components');
const files = [
  '_internal/shell-pane.tsx',
  '_internal/shell-store.tsx',
  '_internal/shell-resizable.tsx',
  '_internal/shell-handles.tsx',
  'chatbar.tsx',
  'toolbar.tsx',
  'segmented-control.tsx',
];

describe('layout effects in server-rendered modules', () => {
  it.each(files)('%s uses the isomorphic useLayoutEffect', (file) => {
    const source = fs.readFileSync(path.join(src, file), 'utf8');
    expect(source).not.toMatch(/React\.useLayoutEffect\b/);
    expect(source).not.toMatch(/useIsomorphicLayoutEffect/);
    expect(source).toMatch(/import \{[^}]*\buseLayoutEffect\b[^}]*\} from 'radix-ui\/internal'/);
  });
});
