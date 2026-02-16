import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const runtime = 'edge';
export const alt = 'Image – Kookie UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Image', 'Kookie UI');
}
