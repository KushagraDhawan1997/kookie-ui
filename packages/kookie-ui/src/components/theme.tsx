'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Direction, Slot, Tooltip as TooltipPrimitive } from 'radix-ui';
import { useComposedRefs, useLayoutEffect } from 'radix-ui/internal';

import { getMatchingGrayColor } from '../helpers/get-matching-gray-color.js';
import { usePropSyncedState } from '../hooks/use-prop-synced-state.js';
import { useDeprecatedPanelBackgroundWarning } from '../helpers/use-deprecation-warning.js';
import { themePropDefs } from './theme.props.js';

import type { ThemeOwnProps } from './theme.props.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';

const noop = () => {};

type ThemeAppearance = (typeof themePropDefs.appearance.values)[number];
type ThemeAccentColor = (typeof themePropDefs.accentColor.values)[number];
type ThemeGrayColor = (typeof themePropDefs.grayColor.values)[number];
type ThemeMaterial = (typeof themePropDefs.material.values)[number];
type ThemePanelBackground = (typeof themePropDefs.panelBackground.values)[number];
type ThemeRadius = (typeof themePropDefs.radius.values)[number];
type ThemeScaling = (typeof themePropDefs.scaling.values)[number];
type ThemeFontFamily = (typeof themePropDefs.fontFamily.values)[number];

interface ThemeChangeHandlers {
  onAppearanceChange: (appearance: ThemeAppearance) => void;
  onAccentColorChange: (accentColor: ThemeAccentColor) => void;
  onGrayColorChange: (grayColor: ThemeGrayColor) => void;
  onMaterialChange: (material: ThemeMaterial) => void;
  onPanelBackgroundChange: (panelBackground: ThemePanelBackground) => void;
  onRadiusChange: (radius: ThemeRadius) => void;
  onScalingChange: (scaling: ThemeScaling) => void;
  onFontFamilyChange: (fontFamily: ThemeFontFamily) => void;
}

interface ThemeContextValue extends ThemeChangeHandlers {
  appearance: ThemeAppearance;
  accentColor: ThemeAccentColor;
  grayColor: ThemeGrayColor;
  resolvedGrayColor: ThemeGrayColor;
  material: ThemeMaterial;
  panelBackground: ThemePanelBackground;
  radius: ThemeRadius;
  scaling: ThemeScaling;
  fontFamily: ThemeFontFamily;
}
// Default theme values used when components render outside a Theme provider
const defaultThemeContext: ThemeContextValue = {
  appearance: themePropDefs.appearance.default,
  accentColor: themePropDefs.accentColor.default,
  grayColor: themePropDefs.grayColor.default,
  resolvedGrayColor: themePropDefs.grayColor.default,
  material: themePropDefs.material.default,
  panelBackground: themePropDefs.panelBackground.default,
  radius: themePropDefs.radius.default,
  scaling: themePropDefs.scaling.default,
  fontFamily: themePropDefs.fontFamily.default,
  onAppearanceChange: noop,
  onAccentColorChange: noop,
  onGrayColorChange: noop,
  onMaterialChange: noop,
  onPanelBackgroundChange: noop,
  onRadiusChange: noop,
  onScalingChange: noop,
  onFontFamilyChange: noop,
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
  const isRoot = context === undefined;
  if (isRoot) {
    return (
      <TooltipPrimitive.Provider delayDuration={200}>
        <Direction.Provider dir="ltr">
          <ThemeRoot {...props} ref={forwardedRef} />
        </Direction.Provider>
      </TooltipPrimitive.Provider>
    );
  }
  return <ThemeImpl {...props} ref={forwardedRef} />;
});
Theme.displayName = 'Theme';

const ThemeRoot = React.forwardRef<ThemeImplElement, ThemeImplPublicProps>(
  (props, forwardedRef) => {
    const {
      appearance: appearanceProp = themePropDefs.appearance.default,
      accentColor: accentColorProp = themePropDefs.accentColor.default,
      grayColor: grayColorProp = themePropDefs.grayColor.default,
      material: materialProp = themePropDefs.material.default,
      panelBackground: panelBackgroundProp = themePropDefs.panelBackground.default,
      radius: radiusProp = themePropDefs.radius.default,
      scaling: scalingProp = themePropDefs.scaling.default,
      fontFamily: fontFamilyProp = themePropDefs.fontFamily.default,
      hasBackground = themePropDefs.hasBackground.default,
      ...rootProps
    } = props;

    useDeprecatedPanelBackgroundWarning(props.panelBackground);

    // Each of these follows its prop but stays independently settable, so
    // `ThemePanel` can change the theme at runtime. Syncing during render
    // rather than in an effect matters here: an effect would commit the old
    // theme first and re-render every consumer of the context a second time.
    const [appearance, setAppearance] = usePropSyncedState(appearanceProp);
    const [accentColor, setAccentColor] = usePropSyncedState(accentColorProp);
    const [grayColor, setGrayColor] = usePropSyncedState(grayColorProp);

    // Material takes precedence over panelBackground
    const effectiveMaterial =
      materialProp !== themePropDefs.material.default ? materialProp : panelBackgroundProp;
    const [material, setMaterial] = usePropSyncedState(effectiveMaterial);

    // Keep panelBackground in sync with material for backward compatibility
    const [panelBackground, setPanelBackground] = usePropSyncedState(material);

    const [radius, setRadius] = usePropSyncedState(radiusProp);
    const [scaling, setScaling] = usePropSyncedState(scalingProp);
    const [fontFamily, setFontFamily] = usePropSyncedState(fontFamilyProp);

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
        material={material}
        panelBackground={panelBackground}
        radius={radius}
        scaling={scaling}
        fontFamily={fontFamily}
        //
        onAppearanceChange={setAppearance}
        onAccentColorChange={setAccentColor}
        onGrayColorChange={setGrayColor}
        onMaterialChange={setMaterial}
        onPanelBackgroundChange={setPanelBackground}
        onRadiusChange={setRadius}
        onScalingChange={setScaling}
        onFontFamilyChange={setFontFamily}
      />
    );
  },
);
ThemeRoot.displayName = 'ThemeRoot';

type ThemeImplElement = React.ElementRef<'div'>;
interface ThemeImplProps extends ThemeImplPublicProps, ThemeImplPrivateProps {}
interface ThemeImplPublicProps
  extends ComponentPropsWithout<'div', RemovedProps | 'dir'>,
    ThemeOwnProps {}
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
    material = props.material ?? context?.material ?? themePropDefs.material.default,
    panelBackground = props.panelBackground ??
      context?.panelBackground ??
      themePropDefs.panelBackground.default,
    radius = props.radius ?? context?.radius ?? themePropDefs.radius.default,
    scaling = props.scaling ?? context?.scaling ?? themePropDefs.scaling.default,
    fontFamily = props.fontFamily ?? context?.fontFamily ?? themePropDefs.fontFamily.default,
    //
    onAppearanceChange = noop,
    onAccentColorChange = noop,
    onGrayColorChange = noop,
    onMaterialChange = noop,
    onPanelBackgroundChange = noop,
    onRadiusChange = noop,
    onScalingChange = noop,
    onFontFamilyChange = noop,
    //
    ...themeProps
  } = props;
  const Comp = asChild ? Slot.Root : 'div';
  const resolvedGrayColor = grayColor === 'auto' ? getMatchingGrayColor(accentColor) : grayColor;
  const isExplicitAppearance = props.appearance === 'light' || props.appearance === 'dark';
  const hasBackground =
    hasBackgroundProp === undefined ? isRoot || isExplicitAppearance : hasBackgroundProp;

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
          material,
          panelBackground,
          radius,
          scaling,
          fontFamily,
          //
          onAppearanceChange,
          onAccentColorChange,
          onGrayColorChange,
          onMaterialChange,
          onPanelBackgroundChange,
          onRadiusChange,
          onScalingChange,
          onFontFamilyChange,
        }),
        [
          appearance,
          accentColor,
          grayColor,
          resolvedGrayColor,
          material,
          panelBackground,
          radius,
          scaling,
          fontFamily,
          //
          onAppearanceChange,
          onAccentColorChange,
          onGrayColorChange,
          onMaterialChange,
          onPanelBackgroundChange,
          onRadiusChange,
          onScalingChange,
          onFontFamilyChange,
        ],
      )}
    >
      <Comp
        data-is-root-theme={isRoot ? 'true' : 'false'}
        data-accent-color={accentColor}
        data-gray-color={resolvedGrayColor}
        // for nested `Theme` background
        data-has-background={hasBackground ? 'true' : 'false'}
        data-material={material}
        data-panel-background={panelBackground}
        data-radius={radius}
        data-scaling={scaling}
        data-font-family={fontFamily}
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
    </ThemeContext.Provider>
  );
});
ThemeImpl.displayName = 'ThemeImpl';

export { Theme, ThemeContext, useThemeContext };
export type { ThemeProps, ThemeContextValue };
