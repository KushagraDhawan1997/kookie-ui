import { describe, expect, it } from 'vitest';

// High contrast mode drops shadows and background colours, so floating panels need a real edge.
function forcedColorsRule(selector: string): CSSStyleRule | undefined {
  const walk = (rules: CSSRuleList, inForced: boolean): CSSStyleRule | undefined => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) {
        const found = walk(rule.cssRules, inForced || rule.conditionText.includes('forced-colors: active'));
        if (found) return found;
      } else if (rule instanceof CSSStyleRule && inForced && rule.selectorText.split(',').some((s) => s.trim() === selector)) {
        return rule;
      }
    }
    return undefined;
  };
  for (const sheet of Array.from(document.styleSheets)) {
    const found = walk(sheet.cssRules, false);
    if (found) return found;
  }
  return undefined;
}

describe('Overlay forced colors', () => {
  for (const selector of ['.kui-PopoverContent', '.kui-TooltipContent']) {
    it(`${selector} gets a CanvasText border`, () => {
      const rule = forcedColorsRule(selector);
      expect(rule).toBeDefined();
      expect(rule!.style.borderStyle).toBe('solid');
      expect(rule!.style.borderColor.toLowerCase()).toBe('canvastext');
    });
  }
});
