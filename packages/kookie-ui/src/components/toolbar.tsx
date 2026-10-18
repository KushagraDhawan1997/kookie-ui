'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Toolbar as ToolbarPrimitive } from 'radix-ui';

import { toolbarRootPropDefs } from './toolbar.props.js';
import { Button } from './button.js';
import { IconButton } from './icon-button.js';
import { Text } from './text.js';
import { extractProps } from '../helpers/extract-props.js';
import { marginPropDefs } from '../props/margin.props.js';

import type { ButtonProps } from './button.js';
import type { TextProps } from './text.js';
import type { MarginProps } from '../props/margin.props.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

/*
 * Toolbar takes Kookie UI v2's contract (v2: components/toolbar), built on Radix instead of
 * Base UI. A toolbar is a row of controls with ONE tab stop: `role="toolbar"`, and the arrow
 * keys move focus between its controls. That keyboard is the reason it is a component.
 *
 * Its `size` reaches every control inside it that does not state its own. The row itself paints
 * nothing; a `ToolbarGroup` draws a quiet well around controls that belong together, and a
 * `ToolbarSeparator` draws a gray hairline between clusters. Use a `Flex` to cluster controls
 * without a well: the row spaces the clusters with `space-between`.
 *
 * The band anchored to a pane's edge (Left / Center / Right / Title) that this name used to
 * mean is `AppBar` since 0.11.0.
 */

type ToolbarSize = NonNullable<GetPropDefTypes<typeof toolbarRootPropDefs>['size']>;
type ToolbarOrientation = NonNullable<GetPropDefTypes<typeof toolbarRootPropDefs>['orientation']>;

interface ToolbarContextValue {
  size: ToolbarSize;
  orientation: ToolbarOrientation;
}

const ToolbarContext = React.createContext<ToolbarContextValue | null>(null);

/** Set by a `ToolbarGroup`: its children rest quiet, and `disabled` turns them all off. */
const ToolbarGroupContext = React.createContext<{ disabled: boolean } | null>(null);

function useToolbarContext(consumer: string): ToolbarContextValue {
  const context = React.useContext(ToolbarContext);
  if (!context) {
    throw new Error(`${consumer} must be rendered inside a Toolbar.`);
  }
  return context;
}

// ============================================================================
// Toolbar (root)
// ============================================================================

type ToolbarOwnProps = GetPropDefTypes<typeof toolbarRootPropDefs>;

interface ToolbarProps
  extends ComponentPropsWithout<typeof ToolbarPrimitive.Root, RemovedProps | 'orientation'>,
    ToolbarOwnProps,
    MarginProps {}

/**
 * A row of controls with one keyboard tab stop. The arrow keys move focus between the controls.
 *
 * Give it an `aria-label` (or `aria-labelledby`) that says what the controls act on.
 *
 * @example
 * ```tsx
 * <Toolbar aria-label="Formatting">
 *   <ToolbarGroup>
 *     <ToolbarButton iconOnly aria-label="Bold" aria-pressed={bold} onClick={toggleBold}>
 *       <HugeiconsIcon icon={TextBoldIcon} strokeWidth={1.75} />
 *     </ToolbarButton>
 *   </ToolbarGroup>
 *   <ToolbarSeparator />
 *   <ToolbarButton>Share</ToolbarButton>
 * </Toolbar>
 * ```
 */
const ToolbarRoot = React.forwardRef<HTMLDivElement, ToolbarProps>((props, forwardedRef) => {
  const size: ToolbarSize = props.size ?? toolbarRootPropDefs.size.default;
  const orientation: ToolbarOrientation = props.orientation ?? toolbarRootPropDefs.orientation.default;
  const { className, orientation: _orientation, children, ...rootProps } = extractProps(
    props,
    toolbarRootPropDefs,
    marginPropDefs,
  );

  const context = React.useMemo(() => ({ size, orientation }), [size, orientation]);

  return (
    <ToolbarPrimitive.Root
      {...rootProps}
      ref={forwardedRef}
      orientation={orientation}
      className={classNames('rt-Toolbar', className)}
    >
      <ToolbarContext.Provider value={context}>{children}</ToolbarContext.Provider>
    </ToolbarPrimitive.Root>
  );
});
ToolbarRoot.displayName = 'Toolbar';

// ============================================================================
// ToolbarGroup
// ============================================================================

interface ToolbarGroupProps extends ComponentPropsWithout<'div', RemovedProps> {
  /** Turns every control in the group off at once. */
  disabled?: boolean;
}

/**
 * Controls that belong together, drawn as one quiet well that stands level with a button
 * beside it. Buttons inside it rest as `ghost` unless they state a `variant`.
 * To cluster controls without a well, use a `Flex`.
 */
const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ className, disabled = false, children, ...props }, forwardedRef) => {
    const { orientation } = useToolbarContext('ToolbarGroup');
    const group = React.useMemo(() => ({ disabled }), [disabled]);
    return (
      <div
        role="group"
        data-orientation={orientation}
        data-disabled={disabled || undefined}
        {...props}
        ref={forwardedRef}
        className={classNames('rt-ToolbarGroup', className)}
      >
        <ToolbarGroupContext.Provider value={group}>{children}</ToolbarGroupContext.Provider>
      </div>
    );
  },
);
ToolbarGroup.displayName = 'Toolbar.Group';

// ============================================================================
// ToolbarButton
// ============================================================================

type ToolbarButtonBaseProps = Omit<ButtonProps, 'as' | 'asChild'>;

/** A labelled button: takes every `Button` prop. */
type ToolbarTextButtonProps = ToolbarButtonBaseProps & {
  iconOnly?: false;
};

/** An icon-only button: renders an `IconButton`, and the type requires an `aria-label`. */
type ToolbarIconButtonProps = Omit<ToolbarButtonBaseProps, 'aria-label' | 'aria-labelledby' | 'overrideStyles'> & {
  iconOnly: true;
  /** The control's accessible name. An icon has no words of its own, so this is required. */
  'aria-label': string;
};

type ToolbarButtonProps = ToolbarTextButtonProps | ToolbarIconButtonProps;

function isPressed(value: React.AriaAttributes['aria-pressed']) {
  return value === true || value === 'true';
}

/**
 * A `Button` that joins the toolbar's keyboard navigation, so a row of them is one tab stop.
 *
 * Set `iconOnly` (with an `aria-label`) for a symbol-only control. Set `aria-pressed` for a
 * control that toggles; a pressed button wears Button's pressed look.
 *
 * It takes the toolbar's `size`, and rests as a gray `soft` button (gray `ghost` inside a
 * `ToolbarGroup`). A stated `size`, `variant` or `color` wins; a stated `variant` without a
 * `color` takes Button's own default colour. It throws outside a `Toolbar`.
 */
const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>((props, forwardedRef) => {
  const toolbar = useToolbarContext('ToolbarButton');
  const group = React.useContext(ToolbarGroupContext);
  const { iconOnly, size, variant, emphasis, color, disabled, ...rest } = props;

  const pressed = isPressed(props['aria-pressed']);
  const stateProps =
    'data-state' in props || props['aria-pressed'] === undefined ? {} : { 'data-state': pressed ? 'on' : 'off' };

  const shared = {
    size: size ?? toolbar.size,
    // A caller states the look by `variant` or the rank by `emphasis`, never both.
    ...(emphasis !== undefined ? { emphasis } : { variant: variant ?? (group ? 'ghost' : 'soft') }),
    // The gray rest is a pair with the default variant: a caller who states a variant or an
    // emphasis gets Button's own colour for it unless they state a colour too.
    color: color ?? (variant || emphasis ? undefined : 'gray'),
    ...stateProps,
  } as const;

  return (
    <ToolbarPrimitive.Button asChild ref={forwardedRef} disabled={disabled || group?.disabled || undefined}>
      {iconOnly ? (
        <IconButton {...(rest as Omit<ToolbarIconButtonProps, 'iconOnly' | 'variant' | 'emphasis'>)} {...shared} />
      ) : (
        <Button {...(rest as Omit<ToolbarTextButtonProps, 'iconOnly' | 'variant' | 'emphasis'>)} {...shared} />
      )}
    </ToolbarPrimitive.Button>
  );
});
ToolbarButton.displayName = 'Toolbar.Button';

// ============================================================================
// ToolbarSeparator
// ============================================================================

type ToolbarSeparatorProps = ComponentPropsWithout<typeof ToolbarPrimitive.Separator, RemovedProps | 'orientation'>;

/**
 * A gray hairline between two clusters, announced as a separator. Its direction is always
 * opposite to the toolbar's.
 */
const ToolbarSeparator = React.forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  ({ className, ...props }, forwardedRef) => {
    useToolbarContext('ToolbarSeparator');
    return (
      <ToolbarPrimitive.Separator
        {...props}
        ref={forwardedRef}
        className={classNames('rt-ToolbarSeparator', className)}
      />
    );
  },
);
ToolbarSeparator.displayName = 'Toolbar.Separator';

// ============================================================================
// ToolbarTitle
// ============================================================================

/** The title's text step: one step above the label of a button at the same size. */
const TITLE_SIZE = { '1': '2', '2': '3', '3': '4', '4': '5' } as const satisfies Record<ToolbarSize, TextProps['size']>;

interface ToolbarTitleProps {
  /** The title text. With none, the title renders nothing. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** The id of the title, so that the toolbar's `aria-labelledby` can point at it. */
  id?: string;
}

/**
 * What the row is about, at its leading edge. One line: it truncates rather than wrapping.
 * Its text step follows the toolbar's `size`, and it takes more air from the controls beside it
 * than they take from each other.
 */
const ToolbarTitle = React.forwardRef<HTMLSpanElement, ToolbarTitleProps>(
  ({ className, children, style, id }, forwardedRef) => {
    const { size } = useToolbarContext('ToolbarTitle');
    if (children === undefined || children === null || children === false) return null;
    return (
      <Text
        ref={forwardedRef}
        as="span"
        size={TITLE_SIZE[size]}
        weight="medium"
        truncate
        id={id}
        style={style}
        className={classNames('rt-ToolbarTitle', className)}
      >
        {children}
      </Text>
    );
  },
);
ToolbarTitle.displayName = 'Toolbar.Title';

// ============================================================================
// Exports
// ============================================================================

const Toolbar = Object.assign(ToolbarRoot, {
  Root: ToolbarRoot,
  Group: ToolbarGroup,
  Button: ToolbarButton,
  Separator: ToolbarSeparator,
  Title: ToolbarTitle,
});

export {
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarTitle,
  ToolbarRoot as Root,
  ToolbarGroup as Group,
  ToolbarButton as Button,
  ToolbarSeparator as Separator,
  ToolbarTitle as Title,
};
export type {
  ToolbarProps,
  ToolbarGroupProps,
  ToolbarButtonProps,
  ToolbarSeparatorProps,
  ToolbarTitleProps,
  ToolbarProps as RootProps,
  ToolbarGroupProps as GroupProps,
  ToolbarButtonProps as ButtonProps,
  ToolbarSeparatorProps as SeparatorProps,
  ToolbarTitleProps as TitleProps,
};
