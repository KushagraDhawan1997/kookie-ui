import type { Metadata } from 'next';

// Manual test pages for component work, not docs. Kept out of search results.
export const metadata: Metadata = {
  robots: { index: false },
};

export default function UiTestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
