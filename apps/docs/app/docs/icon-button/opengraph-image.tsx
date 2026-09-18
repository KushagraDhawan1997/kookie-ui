import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Icon Button – Kookie UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Icon Button', 'Components');
}
