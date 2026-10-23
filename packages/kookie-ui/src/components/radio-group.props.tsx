import { baseRadioPropDefs } from './_internal/base-radio.props.js';
import { asChildPropDef } from '../props/as-child.prop.js';
import { colorPropDef } from '../props/color.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;
// The same list as Radio: a group offers exactly what its items can draw.
const variants = baseRadioPropDefs.variant.values;

const radioGroupRootPropDefs = {
  ...asChildPropDef,
  size: { type: 'enum', className: 'kui-r-size', values: sizes, default: '2', responsive: true },
  variant: { type: 'enum', className: 'kui-variant', values: variants, default: 'raised' },
  ...colorPropDef,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
};

export { radioGroupRootPropDefs };
