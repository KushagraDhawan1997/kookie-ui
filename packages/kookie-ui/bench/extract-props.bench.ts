import { bench, describe } from 'vitest';

import { extractProps } from '../src/helpers/extract-props.js';
import { getMarginStyles } from '../src/helpers/get-margin-styles.js';
import { baseButtonPropDefs } from '../src/components/_internal/base-button.props.js';
import { flexPropDefs } from '../src/components/flex.props.js';
import { textPropDefs } from '../src/components/text.props.js';
import { marginPropDefs } from '../src/props/margin.props.js';
import { layoutPropDefs } from '../src/props/layout.props.js';

// Representative call shapes taken from the docs examples: the overwhelming
// majority of real usage passes a handful of enum props and no responsive
// objects, so that is the case worth optimising for.
const buttonProps = { size: '2', variant: 'classic', highContrast: true, children: 'Save' };
const flexProps = { direction: 'column', gap: '3', align: 'center', p: '4' };
const textProps = { size: '2', weight: 'medium', color: 'gray' };
const responsiveFlexProps = {
  direction: { initial: 'column', md: 'row' },
  gap: { initial: '2', lg: '5' },
  p: { initial: '3', md: '5' },
};
const bareProps = { children: 'hello' };

describe('extractProps', () => {
  bench('button (enum props + margin defs)', () => {
    extractProps({ ...buttonProps }, baseButtonPropDefs, marginPropDefs);
  });

  bench('flex (layout + margin defs)', () => {
    extractProps({ ...flexProps }, flexPropDefs, layoutPropDefs, marginPropDefs);
  });

  bench('text (small def set)', () => {
    extractProps({ ...textProps }, textPropDefs, marginPropDefs);
  });

  bench('flex with responsive objects', () => {
    extractProps({ direction: { ...responsiveFlexProps.direction }, gap: { ...responsiveFlexProps.gap }, p: { ...responsiveFlexProps.p } }, flexPropDefs, layoutPropDefs, marginPropDefs);
  });

  bench('no styling props at all (worst case overhead)', () => {
    extractProps({ ...bareProps }, baseButtonPropDefs, marginPropDefs);
  });
});

describe('getMarginStyles', () => {
  bench('no margin props (the common case)', () => {
    getMarginStyles({});
  });

  bench('one margin prop', () => {
    getMarginStyles({ mt: '4' });
  });

  bench('all margin props', () => {
    getMarginStyles({ m: '1', mx: '2', my: '3', mt: '4', mr: '5', mb: '6', ml: '7' });
  });
});
