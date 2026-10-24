import type { Metadata } from 'next';
import { ComponentsIndex } from '@/components/components-index';

const DESCRIPTION =
  'This index shows every component in the package, grouped by the job a person is doing. Each page covers what the component is, which props it takes and how to use it.';

export const metadata: Metadata = {
  title: 'Components',
  description: DESCRIPTION,
  alternates: { canonical: '/docs' },
};

export default function ComponentsPage() {
  return <ComponentsIndex description={DESCRIPTION} />;
}
