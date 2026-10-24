import { colorPropDef } from '../props/color.prop.js';
import { radiusPropDef } from '../props/radius.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;

const sliderPropDefs = {
  size: { type: 'enum', className: 'kui-r-size', values: sizes, default: '2', responsive: true },
  showTickLabels: { type: 'boolean' },
  snapToTicks: { type: 'boolean' },
  ...colorPropDef,
  ...radiusPropDef,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  showTickLabels: PropDef<boolean>;
  snapToTicks: PropDef<boolean>;
};

export { sliderPropDefs };
