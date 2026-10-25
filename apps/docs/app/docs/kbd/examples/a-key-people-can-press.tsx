import * as React from 'react';
import { Flex, Kbd, Text } from '@kushagradhawan/kookie-ui';

export default function SearchShortcut() {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <Flex align="center" gap="3">
      <Kbd asChild>
        <button type="button" onClick={() => setSearchOpen((open) => !open)}>
          ⌘ K
        </button>
      </Kbd>
      <Text size="2" emphasis="medium">
        {searchOpen ? 'Search is open' : 'Press to open search'}
      </Text>
    </Flex>
  );
}
