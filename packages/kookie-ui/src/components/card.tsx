'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Slot } from 'radix-ui';
import { useComposedRefs } from 'radix-ui/internal';

import { cardPropDefs } from './card.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../hooks/theme-size.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type CardElement = React.ElementRef<'div'>;
type CardOwnProps = GetPropDefTypes<typeof cardPropDefs>;
interface CardProps extends ComponentPropsWithout<'div', RemovedProps>, CardOwnProps {}
/**
 * No card inside a card (RULES.md). A card is an object with its own plane, so two stacked state
 * a relationship the system does not have. Dev only, once per mount. It reads the DOM, not React
 * context: a Dialog or Popover opened from a card portals out of it and starts a fresh plane.
 */
function useNestedCardWarning(): React.RefCallback<HTMLDivElement> {
  const seen = React.useRef(false);
  return React.useCallback((node: HTMLDivElement | null) => {
    if (process.env.NODE_ENV === 'production' || !node || seen.current) return;
    if (!node.parentElement?.closest('.kui-Card')) return;
    seen.current = true;
    console.warn(
      '[kookie-ui] A <Card> is rendering inside another <Card>. Group things inside one card with ' +
        'space, a <Flex> with a gap, not with a second card. For several cards together, put them ' +
        'in a <Flex> or <Grid> on the page, not in a card.',
    );
  }, []);
}

const Card = React.forwardRef<CardElement, CardProps>((ownProps, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, cardPropDefs.size);
  const { asChild, className, ...cardProps } = extractProps(props, cardPropDefs);
  const nestedRef = useNestedCardWarning();
  const ref = useComposedRefs(forwardedRef, nestedRef);
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <Comp
      ref={ref}
      {...cardProps}
      className={classNames('kui-reset', 'kui-BaseCard', 'kui-Card', 'kui-SurfaceNest', className)}
    />
  );
});
Card.displayName = 'Card';

export { Card };
export type { CardProps };
