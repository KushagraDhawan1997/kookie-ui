import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.join(__dirname, '../../src');

function readAllCssFiles(dir: string, out: string[] = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) readAllCssFiles(full, out);
    else if (e.isFile() && e.name.endsWith('.css')) out.push(full);
  }
  return out;
}

function allCss() {
  return [path.join(SRC, 'components'), path.join(SRC, 'styles')].flatMap((r) => (fs.existsSync(r) ? readAllCssFiles(r) : []));
}

/** Properties whose change forces the browser to lay the page out again. */
const LAYOUT_PROPERTIES = 'width|height|top|right|bottom|left|inset|margin|margin-top|margin-right|margin-bottom|margin-left|padding|padding-top|padding-right|padding-bottom|padding-left|flex-basis';

/**
 * Animating a layout property re-runs layout on every frame, for the animated
 * element and anything whose position depends on it. Measured in Chromium: a
 * sidebar collapse animating `width` costs 7ms per frame with 50 rows of
 * content beside it and 14-24ms with 400, against 0.4-0.8ms for the composited
 * equivalent. Twelve indeterminate progress bars animating `width` cost
 * 1.22ms per frame, forever, against 0.39ms.
 *
 * `transform` and `opacity` are handled by the compositor and cost neither
 * layout nor paint.
 */
describe('animations avoid layout properties', () => {
  /**
   * Accordion content animates from zero to its measured height. There is no
   * composited equivalent for growing to an unknown intrinsic size, so these
   * are allowed. They are also scoped to the panel's own subtree rather than a
   * whole shell pane.
   */
  const ALLOWED_KEYFRAMES = new Set(['rt-slide-down', 'rt-slide-up', 'rt-sidebar-slide-down', 'rt-sidebar-slide-up']);

  it('no keyframes animate a layout property', () => {
    const violations: { file: string; keyframes: string; property: string; line: number }[] = [];
    const propertyPattern = new RegExp(`^\\s*(${LAYOUT_PROPERTIES})\\s*:`);

    for (const file of allCss()) {
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
      let current: string | null = null;
      let depth = 0;

      lines.forEach((line, i) => {
        const start = line.match(/@keyframes\s+([\w-]+)/);
        if (start) {
          current = start[1];
          depth = 0;
        }
        if (current) {
          depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
          const match = line.match(propertyPattern);
          if (match && !ALLOWED_KEYFRAMES.has(current)) {
            violations.push({
              file: path.relative(SRC, file),
              keyframes: current,
              property: match[1],
              line: i + 1,
            });
          }
          if (depth <= 0 && !start) current = null;
        }
      });
    }

    expect(
      violations,
      violations.map((v) => `${v.file}:${v.line} @keyframes ${v.keyframes} animates ${v.property}\n  animate transform instead, or add it to ALLOWED_KEYFRAMES with a reason`).join('\n'),
    ).toEqual([]);
  });

  /**
   * The shell panes are the worst case for this: they sit beside the content
   * area, so animating their size re-lays-out the whole application on every
   * frame of a collapse.
   */
  it('shell panes do not animate their size over time', () => {
    const shell = fs.readFileSync(path.join(SRC, 'components/shell.css'), 'utf8');
    const violations: { line: number; content: string }[] = [];

    // A `0s` duration is the point: the pane steps to its size in one layout
    // pass, after a delay that lets the contents finish sliding.
    const pattern = new RegExp(`^\\s*transition:\\s*(${LAYOUT_PROPERTIES})\\s+(?!0s\\b)`);

    shell.split(/\r?\n/).forEach((content, i) => {
      if (pattern.test(content)) violations.push({ line: i + 1, content: content.trim() });
    });

    expect(violations, violations.map((v) => `components/shell.css:${v.line} ${v.content}\n  animating a pane's size re-lays-out .rt-ShellContent on every frame`).join('\n')).toEqual([]);
  });

  it('shell pane contents slide on transform', () => {
    const shell = fs.readFileSync(path.join(SRC, 'components/shell.css'), 'utf8');

    for (const pane of ['Rail', 'Panel', 'Sidebar', 'Inspector', 'Bottom']) {
      const selector = `.rt-Shell${pane}Content {`;
      const start = shell.indexOf(selector);
      expect(start, `${selector} should exist`).toBeGreaterThan(-1);
      const block = shell.slice(start, shell.indexOf('}', start));

      expect(block, `${pane} content should be taken out of flow to slide`).toContain('position: absolute');
      expect(block, `${pane} content should slide on transform`).toMatch(/transform: translate[XY]\(/);
    }
  });

  it('the progress indicator is positioned by transform, not width', () => {
    const progress = fs.readFileSync(path.join(SRC, 'components/progress.css'), 'utf8');
    const indicator = progress.slice(progress.indexOf('.rt-ProgressIndicator'));

    expect(indicator).toContain('transform: translateX(');
    // A full-width bar slid into place, rather than a bar grown to a width.
    expect(indicator).toMatch(/width:\s*var\(--position-full\)/);
  });
});
