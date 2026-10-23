import { asChildPropDef } from '../props/as-child.prop.js';
import { colorPropDef } from '../props/color.prop.js';
import { radiusPropDef } from '../props/radius.prop.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;
const variants = ['raised', 'soft', 'surface', 'outline', 'ghost'] as const;

const accordionRootPropDefs = {
  ...asChildPropDef,
  size: { type: 'enum', className: 'kui-r-size', values: sizes, default: '2', responsive: true },
  variant: { type: 'enum', className: 'kui-variant', values: variants, default: 'raised' },
  ...colorPropDef,
  ...radiusPropDef,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
};

const accordionItemPropDefs = {
  ...asChildPropDef,
} satisfies {
  asChild: PropDef<boolean>;
};

const accordionHeaderPropDefs = {
  ...asChildPropDef,
} satisfies {
  asChild: PropDef<boolean>;
};

const accordionTriggerPropDefs = {
  ...asChildPropDef,
} satisfies {
  asChild: PropDef<boolean>;
};

const accordionContentPropDefs = {
  ...asChildPropDef,
} satisfies {
  asChild: PropDef<boolean>;
};

export {
  accordionRootPropDefs,
  accordionItemPropDefs,
  accordionHeaderPropDefs,
  accordionTriggerPropDefs,
  accordionContentPropDefs,
};

export type AccordionRootOwnProps = {
  size?: (typeof sizes)[number];
  variant?: (typeof variants)[number];
  color?: string;
  radius?: string;
};

export type AccordionItemOwnProps = {
  asChild?: boolean;
};

export type AccordionHeaderOwnProps = {
  asChild?: boolean;
};

export type AccordionTriggerOwnProps = {
  asChild?: boolean;
};

export type AccordionContentOwnProps = {
  asChild?: boolean;
};
