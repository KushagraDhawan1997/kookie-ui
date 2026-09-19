/**
 * One renderer over the chapter registry (`lib/chapters.ts`). A chapter never gets a page of
 * its own: adding one is a row in the registry and a file in `content/`.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChapterPage } from '@/components/chapter-page';
import { BY_SLUG, CHAPTERS, sectionTitle } from '@/lib/chapters';
import type { DocMetadata } from '@/lib/frontmatter';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';

type Params = Promise<{ section: string; chapter: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTERS.map((chapter) => {
    const [section, name] = chapter.slug.split('/');
    return { section, chapter: name };
  });
}

function chapterMetadata(slug: string): DocMetadata | null {
  const chapter = BY_SLUG.get(slug);
  if (!chapter) return null;
  return {
    title: chapter.title,
    description: chapter.blurb,
    category: sectionTitle(chapter.section),
    pathname: `/${chapter.slug}`,
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { section, chapter } = await params;
  const metadata = chapterMetadata(`${section}/${chapter}`);
  return metadata ? generateDocPageMetadata(metadata) : {};
}

export default async function Chapter({ params }: { params: Params }) {
  const { section, chapter } = await params;
  const slug = `${section}/${chapter}`;
  const metadata = chapterMetadata(slug);
  if (!metadata) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateDocStructuredData(metadata) }} />
      <ChapterPage slug={slug} metadata={metadata} />
    </>
  );
}
