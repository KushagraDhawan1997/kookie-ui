import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const runtime = 'edge';
export const alt = 'Colors – Kookie UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Colors', 'Theme');
}
