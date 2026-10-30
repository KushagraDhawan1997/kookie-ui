import { Code, Link, Text } from '@kushagradhawan/kookie-ui';

export default function PropReference() {
  return (
    <Text as="p" size="2">
      The trigger takes every prop of{' '}
      <Link href="/docs/button">
        <Code>Button</Code>
      </Link>
      .
    </Text>
  );
}
