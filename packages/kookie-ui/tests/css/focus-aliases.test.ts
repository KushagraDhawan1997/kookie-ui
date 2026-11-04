import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.join(__dirname, '../../src');

function files(dir: string, out: string[] = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files(full, out);
    else if (/\.(css|tsx?)$/.test(e.name)) out.push(full);
  }
  return out;
}

const strip = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '');
const color = strip(fs.readFileSync(path.join(SRC, 'styles/tokens/color.css'), 'utf8'));
const all = files(SRC).map((f) => strip(fs.readFileSync(f, 'utf8'))).join('\n');

/** The --focus-* aliases sit on every coloured element, so each one costs a declaration per element. */
const declared = [...color.matchAll(/(--focus-a?\d+)\s*:/g)].map((m) => m[1]);
const read = new Set([...all.matchAll(/var\(\s*(--focus-a?\d+)/g)].map((m) => m[1]));

describe('focus aliases', () => {
  it('declares the aliases components read', () => {
    for (const name of read) expect(declared, name).toContain(name);
  });

  it('declares no alias that nothing reads', () => {
    expect(declared.filter((name) => !read.has(name))).toEqual([]);
  });
});
