import type { PropDef } from './prop-def.js';

/** v2's three weights (§15). No bold: a larger size or stronger emphasis says importance. */
const weights = ['regular', 'medium', 'semibold'] as const;

const weightPropDef = {
  weight: {
    type: 'enum',
    className: 'rt-r-weight',
    values: weights,
    responsive: true,
  },
} satisfies {
  weight: PropDef<(typeof weights)[number]>;
};

export { weightPropDef };
