import { asChildPropDef } from '../props/as-child.prop.js';
import { widthPropDefs } from '../props/width.props.js';
import { heightPropDefs } from '../props/height.props.js';

import type { PropDef, GetPropDefTypes } from '../props/prop-def.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const alignValues = ['start', 'center'] as const;
const contentSizes = ['1', '2', '3', '4'] as const;

const dialogContentPropDefs = {
  ...asChildPropDef,
  align: {
    type: 'enum',
    className: 'rt-r-align',
    values: ['start', 'center'],
    default: 'center',
  },
  size: {
    type: 'enum',
    className: 'rt-r-size',
    values: contentSizes,
    default: '2',
    responsive: true,
  },
  width: widthPropDefs.width,
  minWidth: widthPropDefs.minWidth,
  // No default: the size's --overlay-w is the max width until a maxWidth is given.
  maxWidth: widthPropDefs.maxWidth,
  ...heightPropDefs,
} satisfies {
  align: PropDef<(typeof alignValues)[number]>;
  size: PropDef<(typeof contentSizes)[number]>;
  width: PropDef<string>;
  minWidth: PropDef<string>;
  maxWidth: PropDef<string>;
};

type DialogContentOwnProps = GetPropDefTypes<
  typeof dialogContentPropDefs & typeof asChildPropDef & typeof widthPropDefs
>;

export { dialogContentPropDefs };
export type { DialogContentOwnProps };
