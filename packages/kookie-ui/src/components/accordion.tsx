import * as React from 'react';
import classNames from 'classnames';
import { Accordion as AccordionPrimitive } from 'radix-ui';

import {
  accordionRootPropDefs,
  accordionItemPropDefs,
  accordionHeaderPropDefs,
  accordionTriggerPropDefs,
  accordionContentPropDefs,
} from './accordion.props.js';
import { ChevronDownIcon } from './icons.js';
import { Slottable } from './slot.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';

import type {
  AccordionRootOwnProps,
  AccordionItemOwnProps,
  AccordionHeaderOwnProps,
  AccordionTriggerOwnProps,
  AccordionContentOwnProps,
} from './accordion.props.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';

// Root component
type AccordionRootElement = React.ElementRef<typeof AccordionPrimitive.Root>;
// Radix's Root props are a union of single and multiple. Omit each member on its own, so
// `defaultValue`, `value` and `collapsible` survive with the right type for each `type`.
type AccordionRootRadixProps =
  | Omit<AccordionPrimitive.AccordionSingleProps, 'asChild' | 'color'>
  | Omit<AccordionPrimitive.AccordionMultipleProps, 'asChild' | 'color'>;

type AccordionRootProps = AccordionRootRadixProps & AccordionRootOwnProps;

const AccordionRoot = React.forwardRef<AccordionRootElement, AccordionRootProps>(
  (ownProps, forwardedRef) => {
    const props = useThemeSizeProps(ownProps, accordionRootPropDefs.size);
    const { className, radius, color, ...extractedRadixProps } =
      extractProps(props, accordionRootPropDefs);

    const radixProps = extractedRadixProps as React.ComponentPropsWithoutRef<
      typeof AccordionPrimitive.Root
    >;

    // Ensure single accordions can collapse by default unless explicitly set
    if (radixProps.type === 'single' && radixProps.collapsible === undefined) {
      radixProps.collapsible = true;
    }

    return (
      <AccordionPrimitive.Root
        {...radixProps}
        ref={forwardedRef}
        className={classNames('kui-AccordionRoot', className)}
        data-accent-color={color}
        data-radius={radius}
      />
    );
  },
);
AccordionRoot.displayName = 'Accordion.Root';

// Item component
type AccordionItemElement = React.ElementRef<typeof AccordionPrimitive.Item>;
interface AccordionItemProps
  extends ComponentPropsWithout<typeof AccordionPrimitive.Item, RemovedProps>,
    AccordionItemOwnProps {}

const AccordionItem = React.forwardRef<AccordionItemElement, AccordionItemProps>(
  (props, forwardedRef) => {
    const { className, ...itemProps } = extractProps(props, accordionItemPropDefs);

    return (
      <AccordionPrimitive.Item
        {...itemProps}
        ref={forwardedRef}
        className={classNames('kui-AccordionItem', className)}
      />
    );
  },
);
AccordionItem.displayName = 'Accordion.Item';

// Header component
type AccordionHeaderElement = React.ElementRef<typeof AccordionPrimitive.Header>;
interface AccordionHeaderProps
  extends ComponentPropsWithout<typeof AccordionPrimitive.Header, RemovedProps>,
    AccordionHeaderOwnProps {}

const AccordionHeader = React.forwardRef<AccordionHeaderElement, AccordionHeaderProps>(
  (props, forwardedRef) => {
    const { className, ...headerProps } = extractProps(props, accordionHeaderPropDefs);

    return (
      <AccordionPrimitive.Header
        {...headerProps}
        ref={forwardedRef}
        className={classNames('kui-AccordionHeader', className)}
      />
    );
  },
);
AccordionHeader.displayName = 'Accordion.Header';

// Trigger component
type AccordionTriggerElement = React.ElementRef<typeof AccordionPrimitive.Trigger>;
interface AccordionTriggerProps
  extends ComponentPropsWithout<typeof AccordionPrimitive.Trigger, RemovedProps>,
    AccordionTriggerOwnProps {}

const AccordionTrigger = React.forwardRef<AccordionTriggerElement, AccordionTriggerProps>(
  ({ children, ...props }, forwardedRef) => {
    const { className, ...triggerProps } = extractProps(props, accordionTriggerPropDefs);

    return (
      <AccordionPrimitive.Trigger
        {...triggerProps}
        ref={forwardedRef}
        className={classNames('kui-AccordionTrigger', className)}
      >
        <Slottable>{children}</Slottable>
        <ChevronDownIcon className="kui-AccordionChevron" aria-hidden />
      </AccordionPrimitive.Trigger>
    );
  },
);
AccordionTrigger.displayName = 'Accordion.Trigger';

// Content component
type AccordionContentElement = React.ElementRef<typeof AccordionPrimitive.Content>;
interface AccordionContentProps
  extends ComponentPropsWithout<typeof AccordionPrimitive.Content, RemovedProps>,
    AccordionContentOwnProps {}

const AccordionContent = React.forwardRef<AccordionContentElement, AccordionContentProps>(
  (props, forwardedRef) => {
    const { className, children, ...contentProps } = extractProps(props, accordionContentPropDefs);

    return (
      <AccordionPrimitive.Content
        {...contentProps}
        ref={forwardedRef}
        className={classNames('kui-AccordionContent', className)}
      >
        <div className="kui-AccordionContentInner">{children}</div>
      </AccordionPrimitive.Content>
    );
  },
);
AccordionContent.displayName = 'Accordion.Content';

export {
  AccordionRoot as Root,
  AccordionItem as Item,
  AccordionHeader as Header,
  AccordionTrigger as Trigger,
  AccordionContent as Content,
};

export type {
  AccordionRootProps as RootProps,
  AccordionItemProps as ItemProps,
  AccordionHeaderProps as HeaderProps,
  AccordionTriggerProps as TriggerProps,
  AccordionContentProps as ContentProps,
};
