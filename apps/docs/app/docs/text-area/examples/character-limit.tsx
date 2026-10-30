import * as React from 'react';
import { Flex, Text, TextArea } from '@kushagradhawan/kookie-ui';

export default function BioField() {
  const [bio, setBio] = React.useState('');

  return (
    <Flex direction="column" gap="1" width="100%" maxWidth="360px">
      <TextArea
        aria-label="Bio"
        placeholder="A line or two about you"
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        maxLength={160}
      />
      <Text size="1" emphasis="medium" align="right">
        {bio.length} / 160
      </Text>
    </Flex>
  );
}
