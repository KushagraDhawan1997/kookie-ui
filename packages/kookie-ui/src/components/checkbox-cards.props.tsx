import { asChildPropDef } from '../props/as-child.prop.js';
import { colorPropDef } from '../props/color.prop.js';
import { highContrastPropDef } from '../props/high-contrast.prop.js';
import { gridPropDefs } from './grid.props.js';

import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;
const variants = ['outline', 'classic', 'ghost', 'soft', 'surface'] as const;
const panelBackgrounds = ['solid', 'translucent'] as const;

const checkboxCardsRootPropDefs = {
  ...asChildPropDef,
  size: { type: 'enum', className: 'rt-r-size', values: sizes, default: '2', responsive: true },
  variant: { type: 'enum', className: 'rt-variant', values: variants, default: 'surface' },
  panelBackground: { type: 'enum', values: panelBackgrounds, default: undefined },
  ...colorPropDef,
  ...highContrastPropDef,
  columns: { ...gridPropDefs.columns, default: 'repeat(auto-fit, minmax(200px, 1fr))' },
  gap: { ...gridPropDefs.gap, default: '4' },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  panelBackground: PropDef<(typeof panelBackgrounds)[number] | undefined>;
  columns: PropDef<(typeof gridPropDefs.columns.values)[number]>;
  gap: PropDef<(typeof gridPropDefs.gap.values)[number]>;
};

export { checkboxCardsRootPropDefs };
