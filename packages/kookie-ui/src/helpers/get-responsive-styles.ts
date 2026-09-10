import { breakpointSet } from '../props/prop-def.js';
import { hasOwnProperty } from './has-own-property.js';
import { isResponsiveObject } from './is-responsive-object.js';

import type { Responsive, Union } from '../props/prop-def.js';

/**
 * Membership test against a prop def's enum values. Callers that already hold a
 * compiled prop def pass `propValueSet` for an O(1) lookup; the handful of call
 * sites that build options inline fall back to scanning the array.
 */
function includesValue(propValues: string[] | readonly string[], propValueSet: ReadonlySet<string> | undefined, value: string): boolean {
  return propValueSet !== undefined ? propValueSet.has(value) : propValues.includes(value);
}

interface GetResponsiveStylesOptions {
  className: string;
  customProperties: `--${string}`[];
  value: Responsive<Union> | Responsive<string> | undefined;
  propValues: string[] | readonly string[];
  propValueSet?: ReadonlySet<string>;
  parseValue?: (value: string) => string | undefined;
}

function getResponsiveStyles({ className, customProperties, ...args }: GetResponsiveStylesOptions) {
  const responsiveClassNames = getResponsiveClassNames({
    allowArbitraryValues: true,
    className,
    ...args,
  });

  const responsiveCustomProperties = getResponsiveCustomProperties({ customProperties, ...args });
  return [responsiveClassNames, responsiveCustomProperties] as const;
}

interface GetResponsiveClassNamesOptions {
  allowArbitraryValues?: boolean;
  className: string;
  value: Responsive<Union> | Responsive<string> | undefined;
  propValues: string[] | readonly string[];
  propValueSet?: ReadonlySet<string>;
  parseValue?: (value: string) => string | undefined;
}

function getResponsiveClassNames({ allowArbitraryValues, value, className, propValues, propValueSet, parseValue = (value) => value }: GetResponsiveClassNamesOptions): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    if (includesValue(propValues, propValueSet, value)) {
      return getBaseClassName(className, value, parseValue);
    }
    return allowArbitraryValues ? className : undefined;
  }

  if (isResponsiveObject(value)) {
    const object = value;
    const classNames: string[] = [];

    for (const bp in object) {
      // Make sure we are not iterating over keys that aren't breakpoints
      if (!hasOwnProperty(object, bp) || !breakpointSet.has(bp)) {
        continue;
      }

      const value = object[bp];

      if (value !== undefined) {
        if (includesValue(propValues, propValueSet, value)) {
          const baseClassName = getBaseClassName(className, value, parseValue);
          const bpClassName = bp === 'initial' ? baseClassName : `${bp}:${baseClassName}`;
          classNames.push(bpClassName);
        } else if (allowArbitraryValues) {
          const bpClassName = bp === 'initial' ? className : `${bp}:${className}`;
          classNames.push(bpClassName);
        }
      }
    }

    return classNames.length > 0 ? classNames.join(' ') : '';
  }

  if (allowArbitraryValues) {
    return className;
  }
}

function getBaseClassName(className: string, value: string, parseValue: (value: string) => string | undefined): string {
  const delimiter = className ? '-' : '';
  const matchedValue = parseValue(value);
  const isNegative = matchedValue?.startsWith('-');
  const minus = isNegative ? '-' : '';
  const absoluteValue = isNegative ? matchedValue?.substring(1) : matchedValue;
  return `${minus}${className}${delimiter}${absoluteValue}`;
}

interface GetResponsiveCustomPropertiesOptions {
  customProperties: `--${string}`[];
  value: Responsive<Union> | Responsive<string> | undefined;
  propValues: string[] | readonly string[];
  propValueSet?: ReadonlySet<string>;
  parseValue?: (value: string) => string | undefined;
}

function getResponsiveCustomProperties({ customProperties, value, propValues, propValueSet, parseValue = (value) => value }: GetResponsiveCustomPropertiesOptions) {
  // Don't generate custom properties if the value is not arbitrary
  if (!value || (typeof value === 'string' && includesValue(propValues, propValueSet, value))) {
    return undefined;
  }

  let styles: Record<string, string | undefined> | undefined;

  if (typeof value === 'string') {
    const parsed = parseValue(value);
    styles = {};
    for (const customProperty of customProperties) {
      styles[customProperty] = parsed;
    }
    return styles;
  }

  if (isResponsiveObject(value)) {
    const object = value;

    for (const bp in object) {
      // Make sure we are not iterating over keys that aren't breakpoints
      if (!hasOwnProperty(object, bp) || !breakpointSet.has(bp)) {
        continue;
      }

      const value = object[bp];

      // Don't generate a custom property if the value is not arbitrary
      if (value === undefined || includesValue(propValues, propValueSet, value)) {
        continue;
      }

      const parsed = parseValue(value);
      styles ??= {};
      for (const customProperty of customProperties) {
        const bpProperty = bp === 'initial' ? customProperty : `${customProperty}-${bp}`;
        styles[bpProperty] = parsed;
      }
    }
  }

  return styles ?? {};
}

export { getResponsiveStyles, getResponsiveCustomProperties, getResponsiveClassNames };
