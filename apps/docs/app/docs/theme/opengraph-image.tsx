import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Theme – Kookie UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Theme', 'Theme');
}
