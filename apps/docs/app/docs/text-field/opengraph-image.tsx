import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Text Field – Kookie UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Text Field', 'Components');
}
