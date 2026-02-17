import type { PropDef } from './prop-def.js';

const fontFamilies = ['sans', 'mono', 'serif'] as const;

const fontFamilyPropDef = {
  font: {
    type: 'enum',
    className: 'rt-r-ff',
    values: fontFamilies,
  },
} satisfies {
  font: PropDef<(typeof fontFamilies)[number]>;
};

export { fontFamilyPropDef };
