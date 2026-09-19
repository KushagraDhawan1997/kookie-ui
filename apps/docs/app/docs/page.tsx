import type { Metadata } from 'next';
import { ComponentsIndex } from '@/components/components-index';

const DESCRIPTION =
  'Every component in the package. Each page covers what the component is, which props it takes and how to use it.';

export const metadata: Metadata = {
  title: 'Components',
  description: DESCRIPTION,
  alternates: { canonical: '/docs' },
};

export default function ComponentsPage() {
  return <ComponentsIndex description={DESCRIPTION} />;
}
