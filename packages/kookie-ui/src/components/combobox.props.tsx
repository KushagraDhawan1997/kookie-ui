import { colorPropDef } from '../props/color.prop.js';
import { radiusPropDef } from '../props/radius.prop.js';
import { widthPropDefs } from '../props/width.props.js';
import { heightPropDefs } from '../props/height.props.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;

/**
 * Shared responsive sizing inherited by Combobox.Root.
 */
const comboboxRootPropDefs = {
  size: { type: 'enum', className: 'rt-r-size', values: sizes, default: '2', responsive: true },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
};

const triggerVariants = ['raised', 'surface', 'soft', 'outline', 'ghost'] as const;

/**
 * Token-aware props specific to Combobox.Trigger.
 */
const comboboxTriggerPropDefs = {
  variant: { type: 'enum', className: 'rt-variant', values: triggerVariants, default: 'raised' },
  error: { type: 'boolean' },
  loading: { type: 'boolean' },
  disabled: { type: 'boolean' },
  readOnly: { type: 'boolean' },
  ...colorPropDef,
  ...radiusPropDef,
  width: widthPropDefs.width,
  placeholder: { type: 'string' },
} satisfies {
  variant: PropDef<(typeof triggerVariants)[number]>;
  error: PropDef<boolean>;
  loading: PropDef<boolean>;
  disabled: PropDef<boolean>;
  readOnly: PropDef<boolean>;
  width: PropDef<string>;
  placeholder: PropDef<string>;
};

// The list is a menu, and menus stop at size 3.
const contentSizes = ['1', '2', '3', '4'] as const;

/**
 * Styling props for the dropdown surface rendered by Combobox.Content.
 */
const comboboxContentPropDefs = {
  size: { type: 'enum', className: 'rt-r-size', values: contentSizes, default: '2', responsive: true },
  ...colorPropDef,
  width: widthPropDefs.width,
  minWidth: widthPropDefs.minWidth,
  maxWidth: { ...widthPropDefs.maxWidth, default: '480px' },
  ...heightPropDefs,
} satisfies {
  size: PropDef<(typeof contentSizes)[number]>;
  width: PropDef<string>;
  minWidth: PropDef<string>;
  maxWidth: PropDef<string>;
};

export { comboboxRootPropDefs, comboboxTriggerPropDefs, comboboxContentPropDefs };
