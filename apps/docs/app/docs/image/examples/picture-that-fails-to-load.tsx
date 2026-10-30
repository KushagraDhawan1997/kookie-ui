import * as React from 'react';
import { Flex, Image, Text } from '@kushagradhawan/kookie-ui';

export default function ProductPhoto() {
  const [failed, setFailed] = React.useState(false);

  return (
    <Flex direction="column" gap="2" width="100%" maxWidth="240px">
      <Image
        src="/playground/missing-product.jpg"
        alt="Walnut desk lamp"
        width="100%"
        height="160px"
        onError={() => setFailed(true)}
      />
      <Text size="2" emphasis="medium">
        {failed ? 'Photo unavailable' : 'Walnut desk lamp'}
      </Text>
    </Flex>
  );
}
