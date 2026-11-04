'use client';

import dynamic from 'next/dynamic';

// three.js needs the browser, so the scene loads on the client only.
const Editor = dynamic(() => import('./editor').then((m) => m.Editor), { ssr: false });

export default function EditorPage() {
  return <Editor />;
}
