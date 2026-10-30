import * as React from 'react';
import { Flex, Heading, Shell, Text } from '@kushagradhawan/kookie-ui';

export default function DesignEditor() {
  const [width, setWidth] = React.useState(280);

  return (
    <Shell.Root height="320px">
      <Shell.Content>
        <Flex p="5">
          <Heading size="4">Homepage hero</Heading>
        </Flex>
      </Shell.Content>
      <Shell.Inspector
        defaultOpen
        resizable
        size={width}
        onSizeChange={setWidth}
        minSize={240}
        maxSize={400}
        aria-label="Properties"
      >
        <Flex direction="column" gap="1" p="4">
          <Text size="2" weight="medium">Properties</Text>
          <Text size="2" emphasis="medium">{width}px wide</Text>
        </Flex>
      </Shell.Inspector>
    </Shell.Root>
  );
}
