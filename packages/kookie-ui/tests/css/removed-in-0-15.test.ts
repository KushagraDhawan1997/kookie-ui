import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.join(__dirname, '../../src');

function files(dir: string, ext: string[], out: string[] = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files(full, ext, out);
    else if (ext.some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

const css = files(SRC, ['.css']).map((f) => [path.relative(SRC, f), fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')] as const);
const ts = files(SRC, ['.ts', '.tsx']).map((f) => [path.relative(SRC, f), fs.readFileSync(f, 'utf8')] as const);

/** The busy indicators are the only things that move: spinners, skeletons and the indeterminate bar. */
const MOVING = new Set(['components/spinner.css', 'components/skeleton.css', 'components/progress.css', 'components/select.css']);

describe('0.15.0 removed motion', () => {
  it('no stylesheet declares a transition', () => {
    for (const [file, text] of css) expect(text, file).not.toMatch(/(^|[{;\s])transition(-[a-z-]+)?\s*:/m);
  });

  it('only busy indicators animate', () => {
    for (const [file, text] of css) {
      if (MOVING.has(file)) continue;
      expect(text, file).not.toMatch(/(^|[{;\s])animation(-[a-z-]+)?\s*:/m);
      expect(text, file).not.toMatch(/@keyframes/);
    }
  });

  it('no motion tokens are read', () => {
    for (const [file, text] of css) expect(text, file).not.toMatch(/var\(--(motion|duration|ease|transition)-/);
  });

  it('no press or hover scale', () => {
    for (const [file, text] of css) expect(text, file).not.toMatch(/(^|[{;\s])scale\s*:/m);
  });
});

describe('0.15.0 removed the deprecated names', () => {
  it('no stylesheet or component reads panelBackground, classic or override', () => {
    for (const [file, text] of [...css, ...ts]) {
      expect(text, file).not.toMatch(/panelBackground|panel-background|rt-variant-classic|rt-variant-override|--classic-/);
    }
  });
});

describe('0.15.0 is solid only, at a fixed scale', () => {
  it('no stylesheet keys on material, blur, the opacity palette or scaling', () => {
    for (const [file, text] of css) {
      expect(text, file).not.toMatch(/data-material|translucent|backdrop-filter|--blur-|--opacity-\d|data-scaling|--scaling\b/);
    }
  });

  it('no component accepts material or scaling', () => {
    for (const [file, text] of ts) {
      expect(text, file).not.toMatch(/\bmaterial\??\s*:|data-material|['"]translucent['"]|\bscaling\??\s*:|data-scaling/);
    }
  });

  it('the scaling, blur and opacity token files are gone', () => {
    for (const name of ['scaling.css', 'blur.css', 'opacity.css']) {
      expect(fs.existsSync(path.join(SRC, 'styles/tokens', name)), name).toBe(false);
    }
  });
});
