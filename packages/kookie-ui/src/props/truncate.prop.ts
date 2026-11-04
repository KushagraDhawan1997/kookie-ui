import type { PropDef } from './prop-def.js';

const truncatePropDef = {
  truncate: {
    type: 'boolean',
    className: 'kui-truncate',
  },
} satisfies {
  truncate: PropDef<boolean>;
};

export { truncatePropDef };
