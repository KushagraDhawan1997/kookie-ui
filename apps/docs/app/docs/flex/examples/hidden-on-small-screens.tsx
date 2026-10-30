import { Button, Flex } from '@kushagradhawan/kookie-ui';

export default function SecondaryActions() {
  return (
    <Flex gap="2" align="center">
      <Flex display={{ initial: 'none', md: 'flex' }} gap="2">
        <Button emphasis="quiet" color="gray">Share</Button>
        <Button emphasis="quiet" color="gray">Export</Button>
      </Flex>
      <Button emphasis="loud">Publish</Button>
    </Flex>
  );
}
