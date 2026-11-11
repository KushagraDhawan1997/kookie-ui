import { expectAssignable, expectNotAssignable } from 'tsd';
import type { ComponentProps } from 'react';
import { Accordion } from '../../dist/esm/components/index.js';

type RootProps = ComponentProps<typeof Accordion.Root>;

// `color` and `radius` take the same values as every other component, not any string.
expectAssignable<RootProps>({ type: 'single', color: 'red', radius: 'full' });
expectAssignable<RootProps>({ type: 'multiple', color: 'gray', radius: 'none' });
expectNotAssignable<RootProps>({ type: 'single', color: 'banana' });
expectNotAssignable<RootProps>({ type: 'single', radius: 'round' });
