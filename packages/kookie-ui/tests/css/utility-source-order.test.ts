import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const UTILITIES = path.join(__dirname, '../../src/styles/utilities');

/**
 * The arbitrary-value rule of a responsive utility (`.kui-r-p { padding: var(--p) }`) must merge into the empty
 * placeholder that opens its @breakpoints block, so it comes before the breakpoint token rules. Without the
 * placeholder, `p={{ initial: '12px', md: '6' }}` keeps 12px at md and up.
 */
describe('responsive utilities keep their source-order placeholders', () => {
  for (const file of ['padding', 'margin', 'gap', 'inset', 'flex-grow', 'flex-shrink', 'grid-template-columns', 'grid-template-rows']) {
    it(file, () => {
      const css = fs.readFileSync(path.join(UTILITIES, `${file}.css`), 'utf8');
      expect(css).toContain('Keep this selector here to maintain the source order');
    });
  }
});
