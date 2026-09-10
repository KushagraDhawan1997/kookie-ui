import classNames from 'classnames';

import { getCompiledPropDefs } from './compile-prop-defs.js';
import { getResponsiveClassNames, getResponsiveStyles } from './get-responsive-styles.js';
import { isResponsiveObject } from './is-responsive-object.js';
import { mergeStyles } from './merge-styles.js';

import type { CompiledPropDef } from './compile-prop-defs.js';
import type * as React from 'react';
import type { PropDef } from '../props/prop-def.js';

type PropDefsWithClassName<T> = T extends Record<string, PropDef> ? { [K in keyof T]: T[K] extends { className: string } ? K : never }[keyof T] : never;

type ResponsiveValue = Record<string, string | undefined>;

/**
 * Fills in the `initial` breakpoint of a responsive value from the prop def's
 * default, and coerces an invalid `initial` enum value back to that default.
 *
 * Returns the value untouched when nothing needs changing, and a copy otherwise
 * — callers routinely hoist responsive objects to module scope, so mutating the
 * caller's object would corrupt it for every later render.
 */
function normalizeResponsiveValue(value: ResponsiveValue, propDef: CompiledPropDef) {
  let initial = value.initial;
  let changed = false;

  if (propDef.hasDefault && initial === undefined) {
    initial = propDef.default as string | undefined;
    changed = true;
  }

  if (propDef.enumValueSet !== undefined && !propDef.enumValueSet.has(initial)) {
    initial = propDef.default as string | undefined;
    changed = true;
  }

  return changed ? { ...value, initial } : value;
}

/**
 * Takes props, checks them against prop defs that have a `className` on them,
 * adds necessary CSS classes and inline styles, and returns the props without
 * the corresponding prop defs that were used to formulate the new `className`
 * and `style` values. Also applies prop def defaults to every prop.
 */
function extractProps<P extends { className?: string; style?: React.CSSProperties; [key: string]: any }, T extends Record<string, PropDef>[]>(
  props: P,
  ...propDefs: T
): Omit<P & { className?: string; style?: React.CSSProperties }, PropDefsWithClassName<T[number]>> {
  const { styling, passthrough, stylingKeys } = getCompiledPropDefs(propDefs);

  // Copy the props that survive to the element rather than spreading and then
  // deleting the styling keys. Deleting off a spread demotes the object to
  // dictionary mode in V8, and this object is on the render path of every
  // component in the library.
  const extractedProps: Record<string, any> = {};
  for (const key in props) {
    if (stylingKeys.has(key)) continue;
    extractedProps[key] = props[key];
  }

  for (let i = 0; i < passthrough.length; i++) {
    const propDef = passthrough[i];
    const value = extractedProps[propDef.key];

    if (value === undefined) {
      if (propDef.hasDefault) extractedProps[propDef.key] = propDef.default;
      continue;
    }

    // Fall back to the default when the value is not a valid enum value
    if (propDef.enumValueSet !== undefined && !propDef.enumValueSet.has(value) && !isResponsiveObject(value)) {
      extractedProps[propDef.key] = propDef.default;
    }
  }

  let style: ReturnType<typeof mergeStyles>;
  const classes: string[] = [];

  for (let i = 0; i < styling.length; i++) {
    const propDef = styling[i];
    let value = props[propDef.key];

    // Apply prop def defaults
    if (value === undefined && propDef.hasDefault) {
      value = propDef.default;
    }

    // Apply the default value if the value is not a valid enum value
    if (propDef.enumValueSet !== undefined && !propDef.enumValueSet.has(value) && !isResponsiveObject(value)) {
      value = propDef.default;
    }

    if (!value) continue;

    if (isResponsiveObject(value)) {
      // Make sure we are not threading through responsive values for non-responsive prop defs
      if (!propDef.responsive) continue;
      value = normalizeResponsiveValue(value, propDef);
    }

    if (propDef.type === 'enum') {
      const propClassName = getResponsiveClassNames({
        allowArbitraryValues: false,
        value,
        className: propDef.className!,
        propValues: propDef.values,
        propValueSet: propDef.valueSet,
        parseValue: propDef.parseValue,
      });

      if (propClassName) classes.push(propClassName);
      continue;
    }

    if (propDef.type === 'string' || propDef.type === 'enum | string') {
      const [propClassNames, propCustomProperties] = getResponsiveStyles({
        className: propDef.className!,
        customProperties: propDef.customProperties!,
        // `string` prop defs have no enum values, so every value is arbitrary
        propValues: propDef.type === 'string' ? [] : propDef.values,
        propValueSet: propDef.type === 'string' ? undefined : propDef.valueSet,
        parseValue: propDef.parseValue,
        value,
      });

      if (propCustomProperties) style = mergeStyles(style, propCustomProperties);
      if (propClassNames) classes.push(propClassNames);
      continue;
    }

    if (propDef.type === 'boolean') {
      // TODO handle responsive boolean props
      classes.push(propDef.className!);
      continue;
    }
  }

  extractedProps.className = classNames(classes.length > 0 ? classes.join(' ') : undefined, props.className);
  extractedProps.style = mergeStyles(style, props.style);
  return extractedProps as ReturnType<typeof extractProps<P, T>>;
}

export { extractProps };
