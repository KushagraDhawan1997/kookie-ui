import { generateOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Code Block – Kookie UI';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage('Code Block', 'Blocks');
}
