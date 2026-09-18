'use client';

import * as React from 'react';
import NextLink from 'next/link';
import { Box, Code, Link, Text } from '@kushagradhawan/kookie-ui';
import { CodeBlock } from '@/components/blocks/code-block/code-block';
import { TableOfContents } from '@/components/blocks/table-of-contents/table-of-contents';
import { SiteDocsPage } from '@/components/site-docs-page';
import { getAllDependencies, getRequiredBlocks } from '@/lib/blocks-registry';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';

interface BlockContextValue {
  slug: string;
  files: BlockFile[];
}

const BlockContext = React.createContext<BlockContextValue | null>(null);

export interface BlockDocPageProps {
  slug: string;
  files: BlockFile[];
  metadata?: DocMetadata;
  children: React.ReactNode;
}

/** Docs page for a block. Gives `BlockInstallation` in the MDX access to the block's source. */
export function BlockDocPage({ slug, files, metadata, children }: BlockDocPageProps) {
  const context = React.useMemo(() => ({ slug, files }), [slug, files]);

  return (
    <BlockContext.Provider value={context}>
      <SiteDocsPage meta={metadata} tableOfContents={<TableOfContents />}>
        {children}
      </SiteDocsPage>
    </BlockContext.Provider>
  );
}

function Path({ children }: { children: React.ReactNode }) {
  return (
    <Code size="3" color="gray" variant="soft" highContrast>
      {children}
    </Code>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <Text as="p" size="3" my="2" style={{ lineHeight: 1.6 }}>
      {children}
    </Text>
  );
}

/** Dependencies, required blocks and every source file, in the order you need them. */
export function BlockInstallation() {
  const context = React.useContext(BlockContext);
  if (!context) throw new Error('BlockInstallation must be rendered inside BlockDocPage.');

  const { slug, files } = context;
  const dependencies = ['@kushagradhawan/kookie-ui', ...getAllDependencies(slug)];
  const requiredBlocks = getRequiredBlocks(slug);

  return (
    <Box>
      <Paragraph>Install the dependencies.</Paragraph>
      <CodeBlock code={`npm install ${dependencies.join(' ')}`} language="bash" showLineNumbers={false} />

      {requiredBlocks.length > 0 && (
        <Paragraph>
          This block imports{' '}
          {requiredBlocks.map((block, index) => (
            <React.Fragment key={block.slug}>
              {index > 0 && (index === requiredBlocks.length - 1 ? ' and ' : ', ')}
              <Link asChild>
                <NextLink href={`/docs/blocks/${block.slug}`}>{block.title}</NextLink>
              </Link>
            </React.Fragment>
          ))}
          . Copy {requiredBlocks.length > 1 ? 'those' : 'that'} into <Path>components/blocks</Path> first.
        </Paragraph>
      )}

      <Paragraph>
        Copy {files.length > 1 ? 'these files' : 'this file'} into <Path>components/blocks/{slug}</Path>. Keep the
        folder names — blocks import each other by relative path.
      </Paragraph>
      {files.map((file) => (
        <CodeBlock key={file.path} code={file.code} language={file.language} file={file.path} />
      ))}
    </Box>
  );
}
