'use client';

import * as React from 'react';
import { PreviewBlock, type PreviewBlockProps } from '@/components/blocks/preview-block/preview-block';

export interface ExampleProps {
  /** The example's default export, rendered live. Filled in from `src` by remark-examples. */
  of: React.ComponentType;
  /** The same file's source, shown under the stage. Filled in from `src` by remark-examples. */
  code: string;
  /** Fixed stage height, for examples that open a list or a menu. */
  height?: PreviewBlockProps['height'];
  /** @default "dots" */
  background?: PreviewBlockProps['background'];
}

/**
 * One live example on a docs page: the component and its own file's source in one frame.
 * In MDX, write `<Example src="./examples/name" />`; remark-examples imports both halves.
 */
export function Example({ of: Component, code, height, background }: ExampleProps) {
  return (
    <PreviewBlock code={code} height={height} background={background}>
      <Component />
    </PreviewBlock>
  );
}
