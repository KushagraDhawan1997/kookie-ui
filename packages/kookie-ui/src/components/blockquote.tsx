import * as React from 'react';
import classNames from 'classnames';
import { Slot } from 'radix-ui';

import { blockquotePropDefs } from './blockquote.props.js';
import { extractProps } from '../helpers/extract-props.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type BlockquoteElement = React.ElementRef<'blockquote'>;
type BlockQuoteOwnProps = GetPropDefTypes<typeof blockquotePropDefs>;
interface BlockquoteProps
  extends ComponentPropsWithout<'blockquote', RemovedProps>,
    BlockQuoteOwnProps {}
const Blockquote = React.forwardRef<BlockquoteElement, BlockquoteProps>((props, forwardedRef) => {
  // Only Blockquote's own props style it. It wears Text's classes, so it reads like Text.
  const { asChild, className, color, ...blockquoteProps } = extractProps(props, blockquotePropDefs);
  const Comp = asChild ? Slot.Root : 'blockquote';
  return (
    <Comp
      data-accent-color={color}
      {...blockquoteProps}
      ref={forwardedRef}
      className={classNames('kui-Text', 'kui-Blockquote', className)}
    />
  );
});
Blockquote.displayName = 'Blockquote';

export { Blockquote };
export type { BlockquoteProps };
