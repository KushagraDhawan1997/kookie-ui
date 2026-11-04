import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Every --field-* token the theme declares must be read by a component, so setting it does something.
const src = path.join(__dirname, '../../src');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const color = strip(fs.readFileSync(path.join(src, 'styles/tokens/color.css'), 'utf8'));
const components = fs
  .readdirSync(path.join(src, 'components'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => strip(fs.readFileSync(path.join(src, 'components', f), 'utf8')))
  .join('\n');

describe('field tokens', () => {
  const declared = [...new Set([...color.matchAll(/(--field-[\w-]+)\s*:/g)].map((m) => m[1]))];

  it('declares the field tokens', () => {
    expect(declared.length).toBeGreaterThan(0);
  });

  it.each(declared)('%s is read by a component', (token) => {
    expect(components).toMatch(new RegExp(`var\\(${token}\\)`));
  });
});
