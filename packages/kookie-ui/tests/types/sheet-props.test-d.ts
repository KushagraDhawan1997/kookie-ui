import { expectAssignable } from 'tsd';
import type { ComponentProps } from 'react';
import { Sheet } from '../../dist/esm/components/index.js';

type ContentProps = ComponentProps<typeof Sheet.Content>;

expectAssignable<ContentProps>({ side: 'end', size: '2' });

// A Sheet is placed by `side`; the Dialog's `align` is not one of its props.
// @ts-expect-error
const withAlign: ContentProps = { side: 'end', align: 'start' };
