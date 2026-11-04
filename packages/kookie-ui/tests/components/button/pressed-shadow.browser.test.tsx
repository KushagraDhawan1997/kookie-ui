import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Theme } from '../../../src/components/index';

/** :active can't be held in a test, so read the rule the browser would apply. */
function activeShadowFor(className: string) {
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    const stack: CSSRule[] = Array.from(rules);
    while (stack.length) {
      const rule = stack.shift()!;
      if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules) stack.push(...Array.from((rule as CSSGroupingRule).cssRules));
      if (rule instanceof CSSStyleRule && rule.selectorText.includes(':active') && rule.selectorText.includes('kui-BaseButton') && !rule.selectorText.includes('variant-raised') && !rule.selectorText.includes('variant-solid')) {
        if (rule.style.boxShadow) return { selector: rule.selectorText, shadow: rule.style.boxShadow };
      }
    }
  }
  return null;
}

describe('a pressed soft or ghost button', () => {
  it('casts no inset well', () => {
    render(
      <Theme>
        <Button variant="soft">Soft</Button>
        <Button variant="ghost">Ghost</Button>
      </Theme>,
    );
    const rule = activeShadowFor('kui-variant-soft');
    expect(rule).not.toBeNull();
    expect(rule!.shadow).toBe('none');
  });
});
