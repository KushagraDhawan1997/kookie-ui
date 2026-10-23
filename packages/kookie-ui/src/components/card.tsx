'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Slot } from 'radix-ui';

import { cardPropDefs } from './card.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type CardElement = React.ElementRef<'div'>;
type CardOwnProps = GetPropDefTypes<typeof cardPropDefs>;
interface CardProps extends ComponentPropsWithout<'div', RemovedProps>, CardOwnProps {}
const Card = React.forwardRef<CardElement, CardProps>((ownProps, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, cardPropDefs.size);
  const { asChild, className, ...cardProps } = extractProps(props, cardPropDefs);
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <Comp
      ref={forwardedRef}
      {...cardProps}
      className={classNames('kui-reset', 'kui-BaseCard', 'kui-Card', 'kui-SurfaceNest', className)}
    />
  );
});
Card.displayName = 'Card';

export { Card };
export type { CardProps };
