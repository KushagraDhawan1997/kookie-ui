import type React from 'react';

import { colorPropDef } from '../props/color.prop.js';
import { radiusPropDef } from '../props/radius.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;

const selectRootPropDefs = {
  size: { type: 'enum', className: 'rt-r-size', values: sizes, default: '2', responsive: true },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
};

const triggerVariants = ['raised', 'surface', 'soft', 'outline', 'ghost'] as const;

const selectTriggerPropDefs = {
  variant: { type: 'enum', className: 'rt-variant', values: triggerVariants, default: 'raised' },
  material: { type: 'enum', values: ['solid', 'translucent'] },
  /** @deprecated Use `material`. Removed in 0.15.0. */
  panelBackground: { type: 'enum', values: ['solid', 'translucent'] },
  error: { type: 'boolean' },
  loading: { type: 'boolean' },
  disabled: { type: 'boolean' },
  readOnly: { type: 'boolean' },
  ...colorPropDef,
  ...radiusPropDef,
  placeholder: { type: 'ReactNode' },
} satisfies {
  variant: PropDef<(typeof triggerVariants)[number]>;
  material: PropDef<'solid' | 'translucent'>;
  panelBackground: PropDef<'solid' | 'translucent'>;
  error: PropDef<boolean>;
  loading: PropDef<boolean>;
  disabled: PropDef<boolean>;
  readOnly: PropDef<boolean>;
  placeholder: PropDef<React.ReactNode>;
};


const selectContentPropDefs = {
  ...colorPropDef,
} satisfies {
};

export { selectRootPropDefs, selectTriggerPropDefs, selectContentPropDefs };
