import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function readAllCssFiles(dir: string, out: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) readAllCssFiles(full, out);
    else if (e.isFile() && e.name.endsWith('.css')) out.push(full);
  }
  return out;
}

const SRC = path.join(__dirname, '../../src');

function allCss() {
  return [path.join(SRC, 'components'), path.join(SRC, 'styles')].flatMap((r) =>
    fs.existsSync(r) ? readAllCssFiles(r) : [],
  );
}

/**
 * `backdrop-filter: blur(0px)` is not free — the browser still snapshots the
 * backdrop, filters it and composites the result, so it costs the same per
 * frame as a full blur. Measured in Chromium over 300 blurred elements:
 * `blur(0px)` 3.41ms/frame vs `none` 0.42ms/frame.
 *
 * That means `[data-blur='none']` cannot work by zeroing `--blur-factor`; the
 * filter has to be switched off outright. It is switched off by pointing the
 * `--backdrop-filter-*` tokens at `--backdrop-filter-*-enabled`, which
 * tokens/blur.css sets to `none`. Any rule that writes `blur(...)` straight
 * into a `--backdrop-filter-*` token, or onto `backdrop-filter` itself, opts
 * out of that switch and silently reintroduces the cost.
 */
describe('backdrop-filter goes through the switchable tokens', () => {
  it('no rule writes blur() directly into a --backdrop-filter-* token', () => {
    const violations: { file: string; line: number; content: string }[] = [];

    for (const file of allCss()) {
      fs.readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .forEach((content, i) => {
          // The `-enabled` tokens are the definition point — they are exactly
          // what `[data-blur='none']` overrides, so they are allowed to hold a blur.
          if (/^\s*--backdrop-filter-(?!.*-enabled\s*:)[a-z-]+\s*:\s*blur\(/.test(content)) {
            violations.push({ file: path.relative(SRC, file), line: i + 1, content: content.trim() });
          }
        });
    }

    expect(
      violations,
      violations
        .map(
          (v) =>
            `${v.file}:${v.line} ${v.content}\n  use var(--backdrop-filter-<scope>-enabled) so [data-blur='none'] can switch it off`,
        )
        .join('\n'),
    ).toEqual([]);
  });

  it('no rule sets backdrop-filter to a literal blur()', () => {
    const violations: { file: string; line: number; content: string }[] = [];

    for (const file of allCss()) {
      fs.readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .forEach((content, i) => {
          // `@supports not (backdrop-filter: blur(1px))` is a feature probe, not a
          // declaration, and costs nothing.
          if (/^\s*@supports/.test(content)) return;
          if (/^\s*backdrop-filter\s*:\s*blur\(/.test(content)) {
            violations.push({ file: path.relative(SRC, file), line: i + 1, content: content.trim() });
          }
        });
    }

    expect(
      violations,
      violations.map((v) => `${v.file}:${v.line} ${v.content}`).join('\n'),
    ).toEqual([]);
  });

  it('the enabled tokens are defined, and blur.css switches all of them off', () => {
    const constants = fs.readFileSync(path.join(SRC, 'styles/tokens/constants.css'), 'utf8');
    const blur = fs.readFileSync(path.join(SRC, 'styles/tokens/blur.css'), 'utf8');

    for (const scope of ['components', 'panel', 'dialog']) {
      const token = `--backdrop-filter-${scope}-enabled`;
      expect(constants, `${token} must be defined`).toContain(`${token}: blur(`);
      // Once for [data-blur='none'], once for prefers-reduced-transparency.
      expect(blur.split(`${token}: none`).length - 1, `${token} must be switched off`).toBe(2);
    }
  });
});
