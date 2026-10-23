import { colorPropDef } from '../props/color.prop.js';
import { radiusPropDef } from '../props/radius.prop.js';

import type { PropDef } from '../props/prop-def.js';

const variants = ['surface', 'soft', 'outline'] as const;

const progressPropDefs = {
  variant: { type: 'enum', className: 'rt-variant', values: variants, default: 'surface' },
  ...colorPropDef,
  ...radiusPropDef,
  duration: { type: 'string' },
} satisfies {
  variant: PropDef<(typeof variants)[number]>;
  duration: PropDef<string>;
};

export { progressPropDefs };
