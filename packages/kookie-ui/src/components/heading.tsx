import * as React from 'react';
import { Slot } from 'radix-ui';

import { headingPropDefs } from './heading.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { marginPropDefs } from '../props/margin.props.js';

import type { MarginProps } from '../props/margin.props.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type HeadingElement = React.ElementRef<'h1'>;
type HeadingOwnProps = GetPropDefTypes<typeof headingPropDefs>;
interface CommonHeadingProps extends MarginProps, HeadingOwnProps {}
type HeadingH1Props = { as?: 'h1' } & ComponentPropsWithout<'h1', RemovedProps>;
type HeadingH2Props = { as: 'h2' } & ComponentPropsWithout<'h2', RemovedProps>;
type HeadingH3Props = { as: 'h3' } & ComponentPropsWithout<'h3', RemovedProps>;
type HeadingH4Props = { as: 'h4' } & ComponentPropsWithout<'h4', RemovedProps>;
type HeadingH5Props = { as: 'h5' } & ComponentPropsWithout<'h5', RemovedProps>;
type HeadingH6Props = { as: 'h6' } & ComponentPropsWithout<'h6', RemovedProps>;
type HeadingProps = CommonHeadingProps &
  (HeadingH1Props | HeadingH2Props | HeadingH3Props | HeadingH4Props | HeadingH5Props | HeadingH6Props);

// Pre-merge prop definitions at module level to avoid per-render allocation
const mergedPropDefs = { ...headingPropDefs, ...marginPropDefs };

const Heading = React.memo(
  React.forwardRef<HeadingElement, HeadingProps>((props, forwardedRef) => {
    const {
      children,
      className,
      asChild,
      as: Tag = 'h1',
      color,
      ...headingProps
    } = extractProps(props, mergedPropDefs);

    const combinedClassName = className ? `rt-Heading ${className}` : 'rt-Heading';

    if (asChild) {
      return (
        <Slot.Root
          data-accent-color={color}
          {...headingProps}
          ref={forwardedRef}
          className={combinedClassName}
        >
          {children}
        </Slot.Root>
      );
    }

    return (
      <Tag
        data-accent-color={color}
        {...(headingProps as React.HTMLAttributes<HTMLHeadingElement>)}
        ref={forwardedRef as any}
        className={combinedClassName}
      >
        {children}
      </Tag>
    );
  })
);
Heading.displayName = 'Heading';

export { Heading };
export type { HeadingProps };
