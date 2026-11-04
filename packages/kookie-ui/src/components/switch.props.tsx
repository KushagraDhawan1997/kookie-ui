import { colorPropDef } from '../props/color.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;

const switchPropDefs = {
  size: { type: 'enum', className: 'kui-r-size', values: sizes, default: '2', responsive: true },
  ...colorPropDef,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
};

export { switchPropDefs };
