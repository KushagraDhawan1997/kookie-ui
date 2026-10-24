import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Shell, Theme } from '../../../src/components/index';

type Found = { media: string | null; selector: string; style: CSSStyleDeclaration };

function styleRules(): Found[] {
  const found: Found[] = [];
  const walk = (rules: CSSRuleList, media: string | null) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) found.push({ media, selector: rule.selectorText, style: rule.style });
      else if (rule instanceof CSSMediaRule) walk(rule.cssRules, rule.conditionText);
      else if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules, media);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, null);
  return found;
}

describe('shell.css in forced colors', () => {
  it('a focused resize handle keeps a system-colour line', () => {
    const rule = styleRules().find((r) => r.media?.includes('forced-colors: active') && r.selector.includes('.kui-ShellResizer:focus-visible::before'));
    expect(rule?.style.backgroundColor.toLowerCase()).toBe('highlight');
    expect(rule?.style.getPropertyValue('forced-color-adjust')).toBe('none');
  });

  it('an overlay pane gets an edge in place of its shadow, and a fixed pane none', () => {
    const rule = styleRules().find((r) => r.media?.includes('forced-colors: active') && r.selector.includes('.kui-ShellPane'));
    expect(rule?.style.cssText.toLowerCase()).toContain('canvastext');

    const { container } = render(
      <Theme>
        <Shell.Root height="400px">
          <Shell.Sidebar defaultState="expanded" presentation="overlay" />
          <Shell.Inspector defaultOpen presentation="fixed" />
          <Shell.Content>content</Shell.Content>
        </Shell.Root>
      </Theme>,
    );
    const edge = (el: Element | null) => getComputedStyle(el!).getPropertyValue('--kui-shell-edge').trim();
    expect(edge(container.querySelector('.kui-ShellSidebar'))).toBe('1px');
    expect(edge(container.querySelector('.kui-ShellInspector'))).toBe('0px');
  });
});

/** Splits a selector list on its top-level commas. */
function splitList(list: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === '(') depth++;
    else if (list[i] === ')') depth--;
    else if (list[i] === ',' && depth === 0) {
      parts.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(list.slice(start).trim());
  return parts;
}

describe('shell.css selectors', () => {
  it('every :has() rule names its subject', () => {
    const bare = styleRules()
      .flatMap((r) => splitList(r.selector))
      .filter((s) => s.includes('kui-Shell'))
      .filter((s) => /^(:where\()?:has\(/.test(s) || /\s:has\(/.test(s));
    expect(bare).toEqual([]);
  });
});
