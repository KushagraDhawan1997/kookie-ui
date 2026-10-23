'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Direction, Slot, Tooltip as TooltipPrimitive } from 'radix-ui';
import { useComposedRefs, useLayoutEffect } from 'radix-ui/internal';

import { getMatchingGrayColor } from '../helpers/get-matching-gray-color.js';
import { ThemeSizeContext } from '../helpers/theme-size.js';
import { usePropSyncedState } from '../hooks/use-prop-synced-state.js';
import { themePropDefs } from './theme.props.js';

import type { ThemeOwnProps } from './theme.props.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';

const noop = () => {};

type ThemeAppearance = (typeof themePropDefs.appearance.values)[number];
type ThemeAccentColor = (typeof themePropDefs.accentColor.values)[number];
type ThemeGrayColor = (typeof themePropDefs.grayColor.values)[number];
type ThemeRadius = (typeof themePropDefs.radius.values)[number];
type ThemeFontFamily = (typeof themePropDefs.fontFamily.values)[number];
type ThemeSize = (typeof themePropDefs.size.values)[number];
// Headings follow the body font until something sets this, so `undefined` is a
// meaningful value here rather than a missing one.
type ThemeHeadingFontFamily = ThemeFontFamily | undefined;

interface ThemeChangeHandlers {
  onAppearanceChange: (appearance: ThemeAppearance) => void;
  onAccentColorChange: (accentColor: ThemeAccentColor) => void;
  onGrayColorChange: (grayColor: ThemeGrayColor) => void;
  onRadiusChange: (radius: ThemeRadius) => void;
  onFontFamilyChange: (fontFamily: ThemeFontFamily) => void;
  onHeadingFontFamilyChange: (headingFontFamily: ThemeHeadingFontFamily) => void;
  onSizeChange: (size: ThemeSize) => void;
}

interface ThemeContextValue extends ThemeChangeHandlers {
  appearance: ThemeAppearance;
  accentColor: ThemeAccentColor;
  grayColor: ThemeGrayColor;
  resolvedGrayColor: ThemeGrayColor;
  radius: ThemeRadius;
  fontFamily: ThemeFontFamily;
  headingFontFamily: ThemeHeadingFontFamily;
  size: ThemeSize;
}
// Default theme values used when components render outside a Theme provider
const defaultThemeContext: ThemeContextValue = {
  appearance: themePropDefs.appearance.default,
  accentColor: themePropDefs.accentColor.default,
  grayColor: themePropDefs.grayColor.default,
  resolvedGrayColor: themePropDefs.grayColor.default,
  radius: themePropDefs.radius.default,
  fontFamily: themePropDefs.fontFamily.default,
  headingFontFamily: undefined,
  size: themePropDefs.size.default,
  onAppearanceChange: noop,
  onAccentColorChange: noop,
  onGrayColorChange: noop,
  onRadiusChange: noop,
  onFontFamilyChange: noop,
  onHeadingFontFamilyChange: noop,
  onSizeChange: noop,
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function useThemeContext() {
  const context = React.useContext(ThemeContext);
  // Return default context if used outside Theme provider (e.g., during SSR)
  return context ?? defaultThemeContext;
}

interface ThemeProps extends ThemeImplPublicProps {}
const Theme = React.forwardRef<ThemeImplElement, ThemeProps>((props, forwardedRef) => {
  const context = React.useContext(ThemeContext);
  // Direction is inherited: a Radix DirectionProvider above the Theme (for a right-to-left app)
  // wins, and left-to-right stays the default when there is none.
  const dir = Direction.useDirection();
  const isRoot = context === undefined;
  if (isRoot) {
    return (
      <TooltipPrimitive.Provider delayDuration={200}>
        <Direction.Provider dir={dir}>
          <ThemeRoot {...props} ref={forwardedRef} />
        </Direction.Provider>
      </TooltipPrimitive.Provider>
    );
  }
  return <ThemeImpl {...props} ref={forwardedRef} />;
});
Theme.displayName = 'Theme';

const ThemeRoot = React.forwardRef<ThemeImplElement, ThemeImplPublicProps>((props, forwardedRef) => {
  const {
    appearance: appearanceProp = themePropDefs.appearance.default,
    accentColor: accentColorProp = themePropDefs.accentColor.default,
    grayColor: grayColorProp = themePropDefs.grayColor.default,
    radius: radiusProp = themePropDefs.radius.default,
    fontFamily: fontFamilyProp = themePropDefs.fontFamily.default,
    headingFontFamily: headingFontFamilyProp,
    size: sizeProp = themePropDefs.size.default,
    hasBackground = themePropDefs.hasBackground.default,
    ...rootProps
  } = props;

  // Each of these follows its prop but stays independently settable, so
  // the context setters can change the theme at runtime. Syncing during render
  // rather than in an effect matters here: an effect would commit the old
  // theme first and re-render every consumer of the context a second time.
  const [appearance, setAppearance] = usePropSyncedState(appearanceProp);
  const [accentColor, setAccentColor] = usePropSyncedState(accentColorProp);
  const [grayColor, setGrayColor] = usePropSyncedState(grayColorProp);
  const [radius, setRadius] = usePropSyncedState(radiusProp);
  const [fontFamily, setFontFamily] = usePropSyncedState(fontFamilyProp);
  const [headingFontFamily, setHeadingFontFamily] = usePropSyncedState(headingFontFamilyProp);
  const [size, setSize] = usePropSyncedState(sizeProp);

  return (
    <ThemeImpl
      {...rootProps}
      ref={forwardedRef}
      isRoot
      hasBackground={hasBackground}
      //
      appearance={appearance}
      accentColor={accentColor}
      grayColor={grayColor}
      radius={radius}
      fontFamily={fontFamily}
      headingFontFamily={headingFontFamily}
      size={size}
      //
      onAppearanceChange={setAppearance}
      onAccentColorChange={setAccentColor}
      onGrayColorChange={setGrayColor}
      onRadiusChange={setRadius}
      onFontFamilyChange={setFontFamily}
      onHeadingFontFamilyChange={setHeadingFontFamily}
      onSizeChange={setSize}
    />
  );
});
ThemeRoot.displayName = 'ThemeRoot';

type ThemeImplElement = React.ElementRef<'div'>;
interface ThemeImplProps extends ThemeImplPublicProps, ThemeImplPrivateProps {}
interface ThemeImplPublicProps extends ComponentPropsWithout<'div', RemovedProps | 'dir'>, ThemeOwnProps {}
interface ThemeImplPrivateProps extends Partial<ThemeChangeHandlers> {
  isRoot?: boolean;
}
function getClientOS(): 'windows' | 'macos' | 'linux' | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'windows';
  if (ua.includes('Mac')) return 'macos';
  if (ua.includes('Linux')) return 'linux';
  return undefined;
}

const ThemeImpl = React.forwardRef<ThemeImplElement, ThemeImplProps>((props, forwardedRef) => {
  const context = React.useContext(ThemeContext);
  const {
    asChild,
    isRoot,
    hasBackground: hasBackgroundProp,
    //
    appearance = props.appearance ?? context?.appearance ?? themePropDefs.appearance.default,
    accentColor = props.accentColor ?? context?.accentColor ?? themePropDefs.accentColor.default,
    grayColor = props.grayColor ?? context?.resolvedGrayColor ?? themePropDefs.grayColor.default,
    radius = props.radius ?? context?.radius ?? themePropDefs.radius.default,
    fontFamily = props.fontFamily ?? context?.fontFamily ?? themePropDefs.fontFamily.default,
    headingFontFamily = props.headingFontFamily ?? context?.headingFontFamily,
    size = props.size ?? context?.size ?? themePropDefs.size.default,
    //
    onAppearanceChange = noop,
    onAccentColorChange = noop,
    onGrayColorChange = noop,
    onRadiusChange = noop,
    onFontFamilyChange = noop,
    onHeadingFontFamilyChange = noop,
    onSizeChange = noop,
    //
    ...themeProps
  } = props;
  const Comp = asChild ? Slot.Root : 'div';
  const resolvedGrayColor = grayColor === 'auto' ? getMatchingGrayColor(accentColor) : grayColor;
  const isExplicitAppearance = props.appearance === 'light' || props.appearance === 'dark';
  const hasBackground = hasBackgroundProp === undefined ? isRoot || isExplicitAppearance : hasBackgroundProp;

  // `data-os` can only be resolved on the client. Writing it straight to the
  // DOM keeps it out of the server markup — so hydration still matches — without
  // spending a render pass, and a state update here would re-render the whole
  // application on mount.
  const rootRef = React.useRef<ThemeImplElement>(null);
  const composedRef = useComposedRefs(forwardedRef, rootRef);
  const hasExplicitOS = 'data-os' in themeProps;

  useLayoutEffect(() => {
    if (!isRoot || hasExplicitOS) return;
    const node = rootRef.current;
    if (!node) return;

    const os = getClientOS();
    if (!os) return;
    node.setAttribute('data-os', os);
    return () => node.removeAttribute('data-os');
  }, [isRoot, hasExplicitOS]);

  return (
    <ThemeContext.Provider
      value={React.useMemo(
        () => ({
          appearance,
          accentColor,
          grayColor,
          resolvedGrayColor,
          radius,
          fontFamily,
          headingFontFamily,
          size,
          //
          onAppearanceChange,
          onAccentColorChange,
          onGrayColorChange,
          onRadiusChange,
          onFontFamilyChange,
          onHeadingFontFamilyChange,
          onSizeChange,
        }),
        [
          appearance,
          accentColor,
          grayColor,
          resolvedGrayColor,
          radius,
          fontFamily,
          headingFontFamily,
          size,
          //
          onAppearanceChange,
          onAccentColorChange,
          onGrayColorChange,
          onRadiusChange,
          onFontFamilyChange,
          onHeadingFontFamilyChange,
          onSizeChange,
        ],
      )}
    >
      {/* Size travels on its own context as a bare string, so the components
          that read it do not re-render when another theme value changes. */}
      <ThemeSizeContext.Provider value={size}>
        <Comp
          data-is-root-theme={isRoot ? 'true' : 'false'}
          data-accent-color={accentColor}
          data-gray-color={resolvedGrayColor}
          // for nested `Theme` background
          data-has-background={hasBackground ? 'true' : 'false'}
          data-radius={radius}
          data-font-family={fontFamily}
          data-heading-font-family={headingFontFamily}
          ref={composedRef}
          {...themeProps}
          className={classNames(
            'radix-themes',
            {
              light: appearance === 'light',
              dark: appearance === 'dark',
            },
            themeProps.className,
          )}
        />
      </ThemeSizeContext.Provider>
    </ThemeContext.Provider>
  );
});
ThemeImpl.displayName = 'ThemeImpl';

export { Theme, ThemeContext, useThemeContext };
export type { ThemeProps, ThemeContextValue };
