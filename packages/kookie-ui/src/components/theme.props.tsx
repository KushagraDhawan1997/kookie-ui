import { asChildPropDef } from '../props/as-child.prop.js';
import { accentColors, grayColors } from '../props/color.prop.js';
import { radii } from '../props/radius.prop.js';

import type { GetPropDefTypes, PropDef } from '../props/prop-def.js';

const appearances = ['inherit', 'light', 'dark'] as const;
const fontFamilies = ['sans', 'mono', 'serif'] as const;
const sizes = ['1', '2', '3', '4'] as const;

const themePropDefs = {
  ...asChildPropDef,
  /**
   * Whether to apply background color to the Theme element.
   *
   * Defaults to true for the root Theme and for Theme elements that
   * have an explicit light or dark appearance prop.
   */
  hasBackground: { type: 'boolean', default: true },
  /**
   * Sets the color scheme of the theme, typcially referred to as light and dark mode.
   *
   * @link
   * https://www.radix-ui.com/themes/docs/theme/dark-mode
   */
  appearance: { type: 'enum', values: appearances, default: 'inherit' },
  /**
   * Selects one of the accent color options to use in the Theme.
   *
   * @link
   * https://www.radix-ui.com/themes/docs/theme/color
   */
  accentColor: { type: 'enum', values: accentColors, default: 'gray' },
  /**
   * Selects one of the gray color options to use in the Theme.
   *
   * @link
   * https://www.radix-ui.com/themes/docs/theme/color
   */
  grayColor: { type: 'enum', values: grayColors, default: 'gray' },
  /**
   * Sets the default radius of the components.
   *
   * @link
   * https://www.radix-ui.com/themes/docs/theme/visual-style
   */
  radius: { type: 'enum', values: radii, default: 'full' },
  /**
   * Sets the font family used for body text in the theme.
   *
   * Headings follow this unless `headingFontFamily` (or the `--font-heading`
   * token) says otherwise.
   *
   * @default 'sans'
   */
  fontFamily: { type: 'enum', values: fontFamilies, default: 'sans' },
  /**
   * Sets the font family used for `Heading`, independently of body text.
   *
   * Deliberately has no default: when it is left unset no attribute is
   * emitted and `--font-heading` keeps following `--font-body`, so a
   * `--font-heading` override in your own CSS survives a `fontFamily` switch.
   */
  headingFontFamily: { type: 'enum', values: fontFamilies },
  /**
   * The app-wide size index. Every component on the 1-4 control and surface
   * scale that states no `size` of its own takes this one; an explicit
   * `size` always wins. Nested Themes override it for their subtree.
   *
   * @default '2'
   */
  size: { type: 'enum', values: sizes, default: '2' },
} satisfies {
  hasBackground: PropDef<boolean>;
  appearance: PropDef<(typeof appearances)[number]>;
  accentColor: PropDef<(typeof accentColors)[number]>;
  grayColor: PropDef<(typeof grayColors)[number]>;
  radius: PropDef<(typeof radii)[number]>;
  fontFamily: PropDef<(typeof fontFamilies)[number]>;
  headingFontFamily: PropDef<(typeof fontFamilies)[number]>;
  size: PropDef<(typeof sizes)[number]>;
};

type ThemeOwnProps = GetPropDefTypes<typeof themePropDefs & typeof asChildPropDef>;

export { themePropDefs };
export type { ThemeOwnProps };
