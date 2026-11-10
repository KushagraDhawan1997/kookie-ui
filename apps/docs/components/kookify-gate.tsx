'use client';

import { usePathname } from 'next/navigation';

import { Kookify } from '../kookify/kookify';

// Kookify everywhere in the docs except the playground and the UI test pages, which are for
// looking at components on their own.
const SKIP = ['/playground', '/ui-test'];

export function KookifyGate({ stickers, words }: { stickers: string[]; words: string[] }) {
  const pathname = usePathname();
  if (SKIP.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return null;
  return <Kookify stickers={stickers} words={words} />;
}
