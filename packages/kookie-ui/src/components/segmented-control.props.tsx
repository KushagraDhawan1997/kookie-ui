import { radiusPropDef } from '../props/radius.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;
const orientations = ['horizontal', 'vertical'] as const;
// soft is a filled track. raised and outline match the TextField variants of the same name, for
// panels where every other control is raised or outlined.
const variants = ['soft', 'raised', 'outline'] as const;

const segmentedControlRootPropDefs = {
  disabled: { type: 'boolean', default: false },
  size: { type: 'enum', className: 'kui-r-size', values: sizes, default: '2', responsive: true },
  variant: { type: 'enum', className: 'kui-variant', values: variants, default: 'soft' },
  orientation: {
    type: 'enum',
    className: 'kui-r-orientation',
    values: orientations,
    default: 'horizontal',
    responsive: true,
  },
  ...radiusPropDef,
} satisfies {
  disabled?: PropDef<boolean>;
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  orientation: PropDef<(typeof orientations)[number]>;
};

export { segmentedControlRootPropDefs };
