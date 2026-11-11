import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Chip – Womp UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Chip', 'Components');
}
