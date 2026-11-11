import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Notice – Womp UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Notice', 'Components');
}
