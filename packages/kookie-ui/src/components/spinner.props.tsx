import type { PropDef } from '../props/prop-def.js';

const spinnerPropDefs = {
  loading: { type: 'boolean', default: true },
} satisfies {
  loading: PropDef<boolean>;
};

export { spinnerPropDefs };
