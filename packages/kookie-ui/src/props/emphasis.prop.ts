import type { PropDef } from './prop-def.js';

const emphases = ['loud', 'medium', 'quiet'] as const;

// Text-first components only (Text, Heading, Blockquote, Code, DataList.Label).
// No colour + emphasis reads the gray ink ladder; colour + emphasis reads the accent ink ladder.
// Components that need a different default (DataList.Label: 'medium') spread this def and override `default`.
const emphasisPropDef = {
  emphasis: {
    type: 'enum',
    className: 'rt-emphasis',
    values: emphases,
    default: undefined,
  },
} satisfies {
  emphasis: PropDef<(typeof emphases)[number]>;
};

export { emphasisPropDef, emphases };
