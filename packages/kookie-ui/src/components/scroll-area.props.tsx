import { asChildPropDef } from '../props/as-child.prop.js';
import { radiusPropDef } from '../props/radius.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3'] as const;
const scrollbarsValues = ['vertical', 'horizontal', 'both'] as const;

const scrollAreaPropDefs = {
  ...asChildPropDef,
  size: { type: 'enum', className: 'rt-r-size', values: sizes, default: '1', responsive: true },
  ...radiusPropDef,
  scrollbars: { type: 'enum', values: scrollbarsValues, default: 'both' },
  /**
   * Fades the content toward the top and bottom edges while there is more content past them.
   * An edge with nothing hidden past it does not fade. A floating band over an edge can set
   * `--scroll-fade-start` or `--scroll-fade-end` to its height, so content fades as it passes
   * under the band.
   */
  fade: { type: 'boolean', default: false },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  scrollbars: PropDef<(typeof scrollbarsValues)[number]>;
  fade: PropDef<boolean>;
};

export { scrollAreaPropDefs };
