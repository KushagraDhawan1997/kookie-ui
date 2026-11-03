import { Link, Text } from '@kushagradhawan/kookie-ui';

export default function ThemingNote() {
  return (
    <Text as="p" size="3">
      Read the{' '}
      <Link href="/start/theming" underline="always">
        theming guide
      </Link>{' '}
      before you change tokens.
    </Text>
  );
}
