import { dialogContentPropDefs } from './dialog.props.js';
import type { PropDef, GetPropDefTypes } from '../props/prop-def.js';

const alertDialogContentPropDefs = {
  ...dialogContentPropDefs,
} satisfies {
  align: PropDef<'start' | 'center'>;
  size: PropDef<'1' | '2' | '3' | '4'>;
  width: PropDef<string>;
  minWidth: PropDef<string>;
  maxWidth: PropDef<string>;
};

type AlertDialogContentOwnProps = GetPropDefTypes<typeof alertDialogContentPropDefs>;

export { alertDialogContentPropDefs };
export type { AlertDialogContentOwnProps };
