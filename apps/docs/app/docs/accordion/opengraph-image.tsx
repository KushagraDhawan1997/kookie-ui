import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Accordion – Kookie UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Accordion', 'Components');
}
