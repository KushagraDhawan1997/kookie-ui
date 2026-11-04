import * as React from 'react';
import classNames from 'classnames';

import { Flex } from './flex.js';
import { spinnerPropDefs } from './spinner.props.js';
import { extractProps } from '../helpers/extract-props.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type SpinnerElement = React.ElementRef<'span'>;
type SpinnerOwnProps = GetPropDefTypes<typeof spinnerPropDefs>;
interface SpinnerProps
  extends ComponentPropsWithout<'span', RemovedProps>,
    SpinnerOwnProps {}
const Spinner = React.forwardRef<SpinnerElement, SpinnerProps>((props, forwardedRef) => {
  const { className, children, loading, ...spinnerProps } = extractProps(
    props,
    spinnerPropDefs
  );

  // Without children a Spinner is only the wheel, shown while loading.
  if (children === undefined && !loading) return null;

  // Decorative unless named: a named spinner is a status message, an unnamed one is hidden.
  const named =
    spinnerProps['aria-label'] !== undefined || spinnerProps['aria-labelledby'] !== undefined;

  const spinner = (
    <span
      role={named ? 'status' : undefined}
      aria-hidden={named ? undefined : true}
      {...spinnerProps}
      ref={forwardedRef} className={classNames('kui-Spinner', className)}>
      <span className="kui-SpinnerWheel">
        <span className="kui-SpinnerLeaf" />
        <span className="kui-SpinnerLeaf" />
        <span className="kui-SpinnerLeaf" />
        <span className="kui-SpinnerLeaf" />
        <span className="kui-SpinnerLeaf" />
        <span className="kui-SpinnerLeaf" />
        <span className="kui-SpinnerLeaf" />
        <span className="kui-SpinnerLeaf" />
      </span>
      {/* A live region reads its text, not its aria-label, so the name is also its content. */}
      {typeof spinnerProps['aria-label'] === 'string' ? (
        <span className="kui-sr-only">{spinnerProps['aria-label']}</span>
      ) : null}
    </span>
  );

  if (children === undefined) return spinner;

  // With children, one tree whether loading or not, so starting or stopping never remounts them
  // (their state, focus and refs survive). At rest the host is `display: contents`; while loading
  // it centres the wheel over the children, which keep their space but are hidden.
  return (
    <span className="kui-SpinnerHost" data-loading={loading || undefined} aria-busy={loading || undefined}>
      {/* `display: contents` removes the content from the accessibility tree in some browsers, so
          while loading it is removed with `aria-hidden` too. */}
      <span aria-hidden={loading || undefined} className={classNames('kui-SpinnerChildren', loading && 'kui-SpinnerHiddenChildren')}>
        {children}
      </span>
      {loading ? (
        <Flex asChild align="center" justify="center" position="absolute" inset="0">
          <span>{spinner}</span>
        </Flex>
      ) : null}
    </span>
  );
});
Spinner.displayName = 'Spinner';

export { Spinner };
export type { SpinnerProps };
