import { parseVariant } from '../helpers/parse-variant.js';
import { cardPropDefs } from './card.props.js';
import { asChildPropDef } from '../props/as-child.prop.js';
import { colorPropDef } from '../props/color.prop.js';
import { gridPropDefs } from './grid.props.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;
// The same list as Card: a selectable card looks like any other card.
const variants = cardPropDefs.variant.values;
const panelBackgrounds = ['solid', 'translucent'] as const;

const radioCardsRootPropDefs = {
  ...asChildPropDef,
  size: { type: 'enum', className: 'rt-r-size', values: sizes, default: '2', responsive: true },
  variant: { type: 'enum', className: 'rt-variant', values: variants, default: 'raised', parseValue: parseVariant },
  material: { type: 'enum', values: panelBackgrounds, default: undefined },
  /** @deprecated Use `material`. Removed in 0.15.0. */
  panelBackground: { type: 'enum', values: panelBackgrounds, default: undefined },
  ...colorPropDef,
  columns: { ...gridPropDefs.columns, default: 'repeat(auto-fit, minmax(160px, 1fr))' },
  gap: { ...gridPropDefs.gap, default: '4' },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  material: PropDef<(typeof panelBackgrounds)[number] | undefined>;
  panelBackground: PropDef<(typeof panelBackgrounds)[number] | undefined>;
  columns: PropDef<(typeof gridPropDefs.columns.values)[number]>;
  gap: PropDef<(typeof gridPropDefs.gap.values)[number]>;
};

export { radioCardsRootPropDefs };
