import { colorPropDef } from '../props/color.prop.js';
import { radiusPropDef } from '../props/radius.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;
const variants = ['raised', 'surface', 'soft', 'outline', 'ghost'] as const;
const resizeValues = ['none', 'vertical', 'horizontal', 'both'] as const;
const materials = ['solid', 'translucent'] as const;

// prettier-ignore
const textAreaPropDefs = {
  size: { type: 'enum', className: 'rt-r-size', values: sizes, default: '2', responsive: true },
  variant: { type: 'enum', className: 'rt-variant', values: variants, default: 'raised' },
  resize: { type: 'enum', className: 'rt-r-resize', values: resizeValues,  responsive: true },
  material: { type: 'enum', values: materials, default: undefined },
  // Error and validation props
  error: { type: 'boolean', default: false },
  errorMessage: { type: 'string', default: undefined },
  required: { type: 'boolean', default: false },
  // Accessibility props
  'aria-describedby': { type: 'string', default: undefined },
  'aria-labelledby': { type: 'string', default: undefined },
  ...colorPropDef,
  ...radiusPropDef,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  resize: PropDef<(typeof resizeValues)[number]>;
  material: PropDef<(typeof materials)[number] | undefined>;
  error: PropDef<boolean>;
  errorMessage: PropDef<string | undefined>;
  required: PropDef<boolean>;
  'aria-describedby': PropDef<string | undefined>;
  'aria-labelledby': PropDef<string | undefined>;
};

export { textAreaPropDefs };
