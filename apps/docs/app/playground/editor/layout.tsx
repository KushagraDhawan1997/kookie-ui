import type { Metadata, Viewport } from 'next';

// A test page for touch-first editing, not docs. Kept out of search results.
export const metadata: Metadata = {
  title: 'Editor playground',
  robots: { index: false },
};

// Draw under the notch and home indicator; the page pads itself with the safe-area insets.
// Page zoom stays enabled: the canvas takes pinch itself through touch-action, and nothing else
// on the page should block a person from zooming.
export const viewport: Viewport = {
  viewportFit: 'cover',
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
