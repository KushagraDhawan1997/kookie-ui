import { getResponsiveStyles } from './get-responsive-styles.js';
import { mergeStyles } from './merge-styles.js';
import { marginPropDefs } from '../props/margin.props.js';

import type { MarginProps } from '../props/margin.props.js';

const marginValues = marginPropDefs.m.values;
const marginValueSet: ReadonlySet<string> = new Set(marginValues);

// Built once from the prop defs, so the custom properties are the ones the
// stylesheet reads. The common case, a component with no margin props at all,
// is seven property reads and nothing else.
const MARGIN_KEYS = ['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'] as const;
const MARGIN_PROPS: ReadonlyArray<{
  key: keyof MarginProps;
  className: string;
  customProperties: `--${string}`[];
}> = MARGIN_KEYS.map((key) => ({
  key,
  className: marginPropDefs[key].className,
  customProperties: [...marginPropDefs[key].customProperties] as `--${string}`[],
}));

export function getMarginStyles(props: MarginProps) {
  let classes: string[] | undefined;
  let style: ReturnType<typeof mergeStyles>;

  for (let i = 0; i < MARGIN_PROPS.length; i++) {
    const { key, className, customProperties } = MARGIN_PROPS[i];
    const value = props[key];
    if (value === undefined) continue;

    const [propClassNames, propCustomProperties] = getResponsiveStyles({
      className,
      customProperties,
      propValues: marginValues,
      propValueSet: marginValueSet,
      value,
    });

    if (propClassNames) (classes ??= []).push(propClassNames);
    if (propCustomProperties) style = mergeStyles(style, propCustomProperties);
  }

  return [classes !== undefined ? classes.join(' ') : '', style] as const;
}
