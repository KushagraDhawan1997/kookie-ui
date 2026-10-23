import * as React from 'react';
import classNames from 'classnames';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';

import { radioCardsRootPropDefs } from './radio-cards.props.js';
import { Grid } from './grid.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';
import { marginPropDefs } from '../props/margin.props.js';

import type { MarginProps } from '../props/margin.props.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes, Responsive } from '../props/prop-def.js';

type RadioCardsContextValue = {
  size?: Responsive<(typeof radioCardsRootPropDefs.size.values)[number]>;
  variant?: (typeof radioCardsRootPropDefs.variant.values)[number];
};

const RadioCardsContext = React.createContext<RadioCardsContextValue | undefined>(undefined);

const useRadioCardsContext = () => {
  const context = React.useContext(RadioCardsContext);
  return context;
};

type RadioCardsRootElement = React.ElementRef<typeof RadioGroupPrimitive.Root>;
type RadioCardsRootOwnProps = GetPropDefTypes<typeof radioCardsRootPropDefs>;
interface RadioCardsRootProps
  extends ComponentPropsWithout<
      typeof RadioGroupPrimitive.Root,
      'asChild' | 'color' | 'defaultChecked'
    >,
    MarginProps,
    RadioCardsRootOwnProps {}
const RadioCardsRoot = React.forwardRef<RadioCardsRootElement, RadioCardsRootProps>(
  (ownProps, forwardedRef) => {
    const props = useThemeSizeProps(ownProps, radioCardsRootPropDefs.size);
    const {
      className,
      color,
      ...rootProps
    } = extractProps(props, radioCardsRootPropDefs, marginPropDefs);
    // Items read the resolved size, so an unset size still pads them at the default.
    const size = props.size ?? radioCardsRootPropDefs.size.default;
    const variant = props.variant;
    const context = React.useMemo(() => ({ size, variant }), [size, variant]);
    return (
      <RadioCardsContext.Provider value={context}>
        <Grid asChild>
          <RadioGroupPrimitive.Root
            data-accent-color={color}
            {...rootProps}
            ref={forwardedRef}
            className={classNames('rt-RadioCardsRoot', className)}
          />
        </Grid>
      </RadioCardsContext.Provider>
    );
  },
);
RadioCardsRoot.displayName = 'RadioCards.Root';

type RadioCardsItemElement = React.ElementRef<typeof RadioGroupPrimitive.Item>;
interface RadioCardsItemProps
  extends ComponentPropsWithout<typeof RadioGroupPrimitive.Item, RemovedProps>,
    MarginProps {}
const RadioCardsItem = React.forwardRef<RadioCardsItemElement, RadioCardsItemProps>(
  ({ className, ...props }, forwardedRef) => {
    const context = useRadioCardsContext();
    const variantClass = context?.variant ? `rt-variant-${context.variant}` : undefined;
    // extractProps writes the responsive size classes (`md:rt-r-size-3`) a template string cannot.
    const { className: sizeClass } = extractProps(
      { size: context?.size },
      { size: radioCardsRootPropDefs.size },
    );

    return (
      <RadioGroupPrimitive.Item
        {...props}
        asChild={false}
        ref={forwardedRef}
        className={classNames(
          'rt-reset',
          'rt-BaseCard',
          'rt-RadioCardsItem',
          variantClass,
          sizeClass,
          className,
        )}
      />
    );
  },
);
RadioCardsItem.displayName = 'RadioCards.Item';

export { RadioCardsRoot as Root, RadioCardsItem as Item };
export type { RadioCardsRootProps as RootProps, RadioCardsItemProps as ItemProps };
