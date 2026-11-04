import { asChildPropDef } from '../props/as-child.prop.js';
import { grayAccentColorPropDef } from '../props/color.prop.js';
import { radiusPropDef } from '../props/radius.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;
const variants = ['raised', 'solid', 'soft', 'surface', 'outline', 'ghost'] as const;

const chipPropDefs = {
  ...asChildPropDef,
  size: { type: 'enum', className: 'kui-r-size', values: sizes, default: '2', responsive: true },
  variant: { type: 'enum', className: 'kui-variant', values: variants, default: 'raised' },
  ...grayAccentColorPropDef,
  ...radiusPropDef,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
};

export { chipPropDefs };
