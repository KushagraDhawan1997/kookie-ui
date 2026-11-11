import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Image – Womp UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Image', 'Components');
}
