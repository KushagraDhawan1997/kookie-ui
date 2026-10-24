'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Avatar as AvatarPrimitive } from 'radix-ui';

import { avatarPropDefs } from './avatar.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { getSubtree } from '../helpers/get-subtree.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

interface AvatarProps extends AvatarImplProps {}
const Avatar = React.forwardRef<AvatarElement, AvatarProps>((ownProps, forwardedRef) => {
  // An unset size follows the Theme, like a control. Sizes above 4 are only explicit.
  const props = useThemeSizeProps(ownProps, avatarPropDefs.size);
  const {
    asChild,
    children,
    className,
    style,
    color,
    radius,
    status,
    statusLabel,
    badge,
    // Only these reach the <img>, which Radix renders once the picture has loaded.
    fallback,
    onLoadingStatusChange,
    src,
    alt,
    srcSet,
    sizes,
    crossOrigin,
    referrerPolicy,
    loading,
    decoding,
    onLoad,
    onError,
    // Everything else (id, aria-*, data-*, handlers) goes on the root, so it is always rendered.
    ...rootProps
  } = extractProps(props, avatarPropDefs);
  const imageProps = { fallback, onLoadingStatusChange, src, alt, srcSet, sizes, crossOrigin, referrerPolicy, loading, decoding, onLoad, onError };

  if (process.env.NODE_ENV !== 'production') {
    if (status !== undefined && badge !== undefined) {
      console.warn('Avatar: Cannot use both `status` and `badge` props together. ' + 'The `badge` prop will be used and `status` will be ignored.');
    }
  }

  // Cheap boolean checks — no memoization needed
  const isDisabled = asChild && children != null && React.isValidElement(children) && ((children.props as any).disabled === true || (children.props as any)['data-disabled'] === true);

  const hasIndicator = badge !== undefined || status !== undefined;

  const indicator =
    badge !== undefined ? (
      <span className="kui-AvatarBadge">{badge}</span>
    ) : status !== undefined ? (
      <span
        className="kui-AvatarStatus"
        data-accent-color={status}
        role={statusLabel ? 'img' : undefined}
        aria-label={statusLabel || undefined}
        aria-hidden={statusLabel ? undefined : true}
      />
    ) : null;

  return (
    <AvatarPrimitive.Root
      {...(rootProps as React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>)}
      ref={forwardedRef}
      data-accent-color={color}
      data-radius={radius}
      data-disabled={isDisabled || undefined}
      data-has-indicator={hasIndicator || undefined}
      className={classNames('kui-reset', 'kui-AvatarRoot', className)}
      style={style}
      asChild={asChild}
    >
      {/* With asChild, Slot takes exactly one child, so the indicator goes inside it. */}
      {getSubtree(
        { asChild, children },
        <>
          <AvatarImpl {...imageProps} />
          {indicator}
        </>,
      )}
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = 'Avatar';

type AvatarElement = React.ElementRef<typeof AvatarPrimitive.Root>;
type AvatarOwnProps = GetPropDefTypes<typeof avatarPropDefs>;

interface AvatarImplProps extends ComponentPropsWithout<typeof AvatarPrimitive.Image, RemovedProps>, AvatarOwnProps {
  // TODO: See if we can automate making prop defs with `required: true` non nullable
  fallback: NonNullable<AvatarOwnProps['fallback']>;
}

type AvatarImageProps = Pick<
  AvatarImplProps,
  'fallback' | 'onLoadingStatusChange' | 'src' | 'alt' | 'srcSet' | 'sizes' | 'crossOrigin' | 'referrerPolicy' | 'loading' | 'decoding' | 'onLoad' | 'onError'
>;

const AvatarImpl = React.memo(({ fallback, onLoadingStatusChange, ...imageProps }: AvatarImageProps) => {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  const handleLoadingStatusChange = React.useCallback(
    (newStatus: 'idle' | 'loading' | 'loaded' | 'error') => {
      onLoadingStatusChange?.(newStatus);
      setStatus(newStatus);
    },
    [onLoadingStatusChange],
  );

  return (
    <>
      {status === 'idle' || status === 'loading' ? <span className="kui-AvatarFallback" /> : null}

      {status === 'error' ? (
        <AvatarPrimitive.Fallback
          className={classNames('kui-AvatarFallback', {
            'kui-one-letter': typeof fallback === 'string' && fallback.length === 1,
            'kui-two-letters': typeof fallback === 'string' && fallback.length === 2,
          })}
          // Named from alt, like the picture it stands in for. Unnamed, it is decorative.
          {...(imageProps.alt ? { role: 'img', 'aria-label': imageProps.alt } : { 'aria-hidden': true })}
        >
          {fallback}
        </AvatarPrimitive.Fallback>
      ) : null}

      <AvatarPrimitive.Image className="kui-AvatarImage" {...imageProps} onLoadingStatusChange={handleLoadingStatusChange} />
    </>
  );
});

AvatarImpl.displayName = 'AvatarImpl';

export { Avatar };
export type { AvatarProps };
