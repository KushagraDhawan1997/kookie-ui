import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { layoutPropDefs } from '../../src/props/layout.props';
import { paddingPropDefs } from '../../src/props/padding.props';

const INSET = fs.readFileSync(path.join(__dirname, '../../src/styles/utilities/inset.css'), 'utf8');

/**
 * Position offsets take the same space steps as padding (0-12). The 0.17 space codemod moves an old
 * `top="9"` (64px) to `top="10"`; if 10 were not a step, it would fall through as the raw custom
 * property `--top: 10`, which is unitless and invalid, and the offset would silently vanish.
 */
describe('position props take every space step', () => {
  const steps = paddingPropDefs.p.values as readonly string[];

  for (const edge of ['inset', 'top', 'right', 'bottom', 'left'] as const) {
    it(edge, () => {
      const values = layoutPropDefs[edge].values as readonly string[];
      for (const step of steps) {
        expect(values).toContain(step);
        const rule = step === '0' ? `${edge}: 0;` : `${edge}: var(--space-${step});`;
        expect(INSET).toContain(`.kui-r-${edge}-${step} {\n    ${rule}`);
      }
    });
  }
});
