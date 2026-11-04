import { expectAssignable } from 'tsd';
import type { ComponentProps } from 'react';
import { Checkbox, CheckboxGroup, Radio, RadioGroup, Slider, Switch } from '../../dist/esm/components/index.js';

// The marks have one look, as in v2. Size and color stay; `variant` is not one of their props.

expectAssignable<ComponentProps<typeof Switch>>({ size: '2', color: 'blue' });
// @ts-expect-error
const switchVariant: ComponentProps<typeof Switch> = { variant: 'surface' };

expectAssignable<ComponentProps<typeof Slider>>({ size: '2', color: 'blue' });
// @ts-expect-error
const sliderVariant: ComponentProps<typeof Slider> = { variant: 'surface' };

expectAssignable<ComponentProps<typeof Checkbox>>({ size: '2', color: 'blue' });
// @ts-expect-error
const checkboxVariant: ComponentProps<typeof Checkbox> = { variant: 'soft' };

expectAssignable<ComponentProps<typeof CheckboxGroup.Root>>({ size: '2', color: 'blue' });
// @ts-expect-error
const checkboxGroupVariant: ComponentProps<typeof CheckboxGroup.Root> = { variant: 'soft' };

expectAssignable<ComponentProps<typeof Radio>>({ value: 'a', size: '2', color: 'blue' });
// @ts-expect-error
const radioVariant: ComponentProps<typeof Radio> = { value: 'a', variant: 'soft' };

expectAssignable<ComponentProps<typeof RadioGroup.Root>>({ size: '2', color: 'blue' });
// @ts-expect-error
const radioGroupVariant: ComponentProps<typeof RadioGroup.Root> = { variant: 'soft' };
