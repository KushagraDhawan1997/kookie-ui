import { getResponsiveStyles } from './get-responsive-styles.js';
import { mergeStyles } from './merge-styles.js';
import { marginPropDefs } from '../props/margin.props.js';

import type { MarginProps } from '../props/margin.props.js';

const marginValues = marginPropDefs.m.values;
const marginValueSet: ReadonlySet<string> = new Set(marginValues);

// Static table so the common case — a component with no margin props at all —
// is seven property reads and nothing else.
const MARGIN_PROPS: ReadonlyArray<{
  key: keyof MarginProps;
  className: string;
  customProperties: `--${string}`[];
}> = [
  { key: 'm', className: 'rt-r-m', customProperties: ['--margin'] },
  { key: 'mx', className: 'rt-r-mx', customProperties: ['--margin-left', '--margin-right'] },
  { key: 'my', className: 'rt-r-my', customProperties: ['--margin-top', '--margin-bottom'] },
  { key: 'mt', className: 'rt-r-mt', customProperties: ['--margin-top'] },
  { key: 'mr', className: 'rt-r-mr', customProperties: ['--margin-right'] },
  { key: 'mb', className: 'rt-r-mb', customProperties: ['--margin-bottom'] },
  { key: 'ml', className: 'rt-r-ml', customProperties: ['--margin-left'] },
];

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
