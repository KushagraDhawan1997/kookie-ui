import { asChildPropDef } from '../props/as-child.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;
const variants = ['raised', 'surface', 'outline', 'ghost', 'soft'] as const;

const cardPropDefs = {
  ...asChildPropDef,
  /** Padding --surface-p-N and corner --radius-surface-N. Unset, it follows the Theme size. */
  size: { type: 'enum', className: 'rt-r-size', values: sizes, default: '2', responsive: true },
  variant: { type: 'enum', className: 'rt-variant', values: variants, default: 'raised' },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
};

export { cardPropDefs };
