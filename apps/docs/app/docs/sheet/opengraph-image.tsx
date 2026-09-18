import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Sheet – Kookie UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Sheet', 'Components');
}
