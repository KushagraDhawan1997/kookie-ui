import Link from 'next/link';
import { Box, Card, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';

export default function ProjectCard() {
  return (
    <Box width="100%" maxWidth="320px">
      <Card asChild>
        <Link href="/docs/card">
          <Flex direction="column" gap="1">
            <Heading as="h3" size="3">Atlas</Heading>
            <Text size="2" emphasis="medium">Updated 2 hours ago</Text>
          </Flex>
        </Link>
      </Card>
    </Box>
  );
}
