import { expectAssignable, expectNotAssignable } from 'tsd';
import type { ComponentProps } from 'react';
import { Combobox } from '../../dist/esm/components/index.js';

type RootProps = ComponentProps<typeof Combobox.Root>;
type TriggerProps = ComponentProps<typeof Combobox.Trigger>;
type ContentProps = ComponentProps<typeof Combobox.Content>;
type InputProps = ComponentProps<typeof Combobox.Input>;
type ItemProps = ComponentProps<typeof Combobox.Item>;

expectAssignable<RootProps>({ value: 'a', onValueChange: (_value: string | null) => {} });
expectAssignable<RootProps>({ searchValue: '', onSearchValueChange: (_value: string) => {} });
expectAssignable<RootProps>({ displayValue: (value: string | null) => value ?? undefined });
expectAssignable<RootProps>({ size: { initial: '1', md: '3' } });

expectAssignable<TriggerProps>({ variant: 'soft', 'aria-label': 'Country' });
expectNotAssignable<TriggerProps>({ variant: 'solid' });

expectAssignable<ContentProps>({ variant: 'soft', size: '2' });
expectAssignable<InputProps>({ placeholder: 'Search' });

expectAssignable<ItemProps>({ value: 'uk', label: 'United Kingdom', keywords: ['britain'] });
expectAssignable<ItemProps>({ onSelect: (_value: string) => {} });
