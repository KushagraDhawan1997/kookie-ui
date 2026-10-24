import { expectAssignable, expectNotAssignable } from 'tsd';
import type { VirtualMenuProps } from '../../dist/esm/components/index.js';

type Props = VirtualMenuProps<{ name: string }>;
const items = [{ name: 'a' }];

expectAssignable<Props>({ items, itemLabel: 'name' });
expectAssignable<Props>({ items, renderItem: () => null });
expectAssignable<Props>({ items, itemLabel: 'name', 'aria-labelledby': 'label', id: 'list' });
expectNotAssignable<Props>({ items });
