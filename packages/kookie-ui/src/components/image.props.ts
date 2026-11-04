import { radiusPropDef } from '../props/radius.prop.js';

import type { PropDef } from '../props/prop-def.js';

const objectFitValues = ['cover', 'contain', 'fill', 'scale-down', 'none'] as const;

const imagePropDefs = {
  ...radiusPropDef,
  /**
   * How the picture fills its box, as CSS `object-fit`.
   * @link https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
   */
  fit: { type: 'enum', className: 'kui-r-fit', values: objectFitValues, default: 'cover' },
} satisfies {
  fit: PropDef<(typeof objectFitValues)[number]>;
};

export { imagePropDefs };
