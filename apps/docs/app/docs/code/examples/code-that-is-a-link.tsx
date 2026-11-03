import NextLink from 'next/link';
import { Code, Link, Text } from '@kushagradhawan/kookie-ui';

export default function RelatedComponent() {
  return (
    <Text as="p" size="2">
      For a clickable control, use{' '}
      <Link asChild>
        <NextLink href="/docs/button">
          <Code>Button</Code>
        </NextLink>
      </Link>
      .
    </Text>
  );
}
