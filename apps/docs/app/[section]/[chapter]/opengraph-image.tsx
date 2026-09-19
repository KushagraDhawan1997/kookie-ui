import { BY_SLUG, CHAPTERS, sectionTitle } from '@/lib/chapters';
import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Kookie UI';
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return CHAPTERS.map((chapter) => {
    const [section, name] = chapter.slug.split('/');
    return { section, chapter: name };
  });
}

export default async function Image({ params }: { params: Promise<{ section: string; chapter: string }> }) {
  const { section, chapter } = await params;
  const entry = BY_SLUG.get(`${section}/${chapter}`);
  return generateOgImage(entry?.title ?? 'Kookie UI', entry ? sectionTitle(entry.section) : 'Docs');
}
