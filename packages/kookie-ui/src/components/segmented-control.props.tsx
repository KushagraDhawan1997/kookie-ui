import { radiusPropDef } from '../props/radius.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;
const orientations = ['horizontal', 'vertical'] as const;

const segmentedControlRootPropDefs = {
  disabled: { type: 'boolean', className: 'disabled', default: false },
  size: { type: 'enum', className: 'rt-r-size', values: sizes, default: '2', responsive: true },
  orientation: {
    type: 'enum',
    className: 'rt-r-orientation',
    values: orientations,
    default: 'horizontal',
    responsive: true,
  },
  material: { type: 'enum', values: ['solid', 'translucent'] },
  ...radiusPropDef,
} satisfies {
  disabled?: PropDef<boolean>;
  size: PropDef<(typeof sizes)[number]>;
  orientation: PropDef<(typeof orientations)[number]>;
  material: PropDef<'solid' | 'translucent'>;
};

export { segmentedControlRootPropDefs };
