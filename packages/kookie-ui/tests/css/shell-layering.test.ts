import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const css = fs.readFileSync(path.join(__dirname, '../../src/components/shell.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));

/** The declarations of every rule whose selector list names `selector` exactly. */
function rule(selector: string): string {
  const found: string[] = [];
  const pattern = /([^{}]+)\{([^{}]*)\}/g;
  for (let match = pattern.exec(css); match; match = pattern.exec(css)) {
    const selectors = match[1].split(',').map((part) => part.trim());
    if (selectors.includes(selector)) found.push(match[2]);
  }
  if (found.length === 0) throw new Error(`no rule for ${selector}`);
  return found.join('\n');
}

/**
 * How the panes stack and where they start. Each case was a defect a
 * browser showed and jsdom cannot lay out, so the rule itself is held here.
 */
describe('Shell layering and placement', () => {
  it('the content is its own stacking context at all times, so nothing inside it paints over a pane', () => {
    expect(rule('.rt-ShellContent')).toMatch(/isolation:\s*isolate/);
  });

  it('every Root states the rail offset, so a nested Shell never inherits its parent’s', () => {
    expect(rule('.rt-ShellRoot')).toMatch(/--shell-rail-offset:\s*0px/);
  });

  it('a floating Sidebar starts beside the Rail, as a floating Panel does', () => {
    expect(rule('.rt-ShellSidebar')).toMatch(/inset-inline-start:\s*var\(--rt-shell-offset, 0px\)/);
    expect(rule('.rt-ShellPanel')).toMatch(/inset-inline-start:\s*var\(--rt-shell-offset, 0px\)/);
  });

  it('every overlay cap leaves the dismiss strip after the pane’s own start', () => {
    const caps = css.match(/--rt-shell-cap:\s*calc\([^;]+\);/g) ?? [];
    expect(caps.length).toBeGreaterThan(0);
    for (const cap of caps) expect(cap).toContain('var(--rt-shell-start, 0px)');
  });

  it('a pane with a handle sits above the pane beside it', () => {
    expect(rule('.rt-ShellPane:has(> .rt-ShellResizer)')).toMatch(/z-index:\s*var\(--rt-shell-z, 2\)/);
  });

  it('a Sidebar thin by its untouched default shows no handle, at every breakpoint', () => {
    const thinRules = css.match(/\.rt-ShellSidebar\[data-state='auto'\]\[data-auto(?:-[a-z]+)?='thin'\]\s*\{[^}]*\}/g) ?? [];
    expect(thinRules.length).toBe(7);
    for (const r of thinRules) expect(r).toMatch(/--rt-shell-thin:\s*none/);
    expect(rule('.rt-ShellResizer')).toMatch(/display:\s*var\(--rt-shell-thin, var\(--rt-shell-handle, flex\)\)/);
  });

  it('the handle flips by the nearest direction, not by any rtl ancestor', () => {
    expect(css).not.toMatch(/\[dir='rtl'\]/);
    expect(css).toContain(".rt-ShellResizer[data-orientation='vertical'][data-edge='end']:dir(rtl)");
  });

  it('a peeking Panel that follows the Rail outranks the follower placement', () => {
    expect(() => rule('.rt-ShellRail ~ .rt-ShellPanel[data-presentation-follows][data-peek][data-state]')).not.toThrow();
  });

  it('the shared inset gap counts only a neighbour shown in the frame', () => {
    const shared = css.match(/[^{}]+\{\s*margin-inline-start:\s*0;\s*\}/)?.[0] ?? '';
    expect(shared).toContain("[data-presentation='fixed']");
    expect(shared).not.toMatch(/:not\(\[data-state='closed'\]\)/);
  });

  it('an auto-height Shell places its overlays and scrim on the window', () => {
    const fixed = rule(".rt-ShellRoot[data-height='auto'] > .rt-ShellScrim");
    expect(fixed).toMatch(/position:\s*fixed/);
    expect(() => rule(".rt-ShellRoot[data-height='auto'] > .rt-ShellPane[data-presentation='overlay']")).not.toThrow();
  });
});
