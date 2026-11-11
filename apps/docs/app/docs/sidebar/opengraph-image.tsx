import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Sidebar – Womp UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Sidebar', 'Components');
}
