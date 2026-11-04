import { colorPropDef } from '../../props/color.prop.js';

import type { PropDef } from '../../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;
const wrapValues = ['nowrap', 'wrap', 'wrap-reverse'] as const;
const justifyValues = ['start', 'center', 'end'] as const;

const baseTabListPropDefs = {
  size: { type: 'enum', className: 'kui-r-size', values: sizes, default: '2', responsive: true },
  wrap: {
    type: 'enum',
    className: 'kui-r-fw',
    values: wrapValues,
    responsive: true,
  },
  justify: {
    type: 'enum',
    className: 'kui-r-jc',
    values: justifyValues,
    responsive: true,
  },
  ...colorPropDef,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  wrap: PropDef<(typeof wrapValues)[number]>;
  justify: PropDef<(typeof justifyValues)[number]>;
};

export { baseTabListPropDefs };
