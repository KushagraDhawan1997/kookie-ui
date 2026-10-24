import { colorPropDef } from '../props/color.prop.js';

import type { PropDef } from '../props/prop-def.js';

const orientationValues = ['horizontal', 'vertical'] as const;

const separatorPropDefs = {
  orientation: {
    type: 'enum',
    className: 'kui-r-orientation',
    values: orientationValues,
    default: 'horizontal',
    responsive: true,
  },
  color: { ...colorPropDef.color, default: 'gray' },
  decorative: { type: 'boolean', default: false },
  light: { type: 'boolean', className: 'kui-light', default: false },
} satisfies {
  orientation: PropDef<(typeof orientationValues)[number]>;
  color: typeof colorPropDef.color;
  decorative: PropDef<boolean>;
  light: PropDef<boolean>;
};

export { separatorPropDefs };
