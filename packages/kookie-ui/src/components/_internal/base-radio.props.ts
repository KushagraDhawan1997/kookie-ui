import { colorPropDef } from '../../props/color.prop.js';

import type { PropDef } from '../../props/prop-def.js';

const sizes = ['1', '2', '3'] as const;
const variants = ['raised', 'solid', 'soft', 'outline', 'surface'] as const;

const baseRadioPropDefs = {
  size: { type: 'enum', className: 'rt-r-size', values: sizes, default: '2', responsive: true },
  variant: { type: 'enum', className: 'rt-variant', values: variants, default: 'raised' },
  ...colorPropDef,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
};

export { baseRadioPropDefs };
