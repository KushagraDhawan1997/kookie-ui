import { createMarkdownComponents } from '@/components/blocks/markdown/markdown';

export const chatComponents = createMarkdownComponents();

export const chatReply = [
  'Sure. Run this from the project root:',
  '',
  '```bash',
  'pnpm add @kushagradhawan/kookie-ui',
  '```',
  '',
  'Then wrap your app in **Theme**. Two things to check:',
  '',
  '- The stylesheet is imported once',
  '- `Theme` sits at the root',
].join('\n');

export const chatSource = `const components = createMarkdownComponents();

<MarkdownContent spacing="compact">
  <ReactMarkdown components={components}>{reply}</ReactMarkdown>
</MarkdownContent>`;
