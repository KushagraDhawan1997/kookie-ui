import { Flex, Link, Text } from '@kushagradhawan/kookie-ui';

const fileUrl = 'https://files.example.com/projects/atlas/reports/2024-annual-review.pdf';

export default function SharedFileLink() {
  return (
    <Flex direction="column" gap="1" width="220px">
      <Text size="1" emphasis="medium">Shared link</Text>
      <Link href={fileUrl} size="2" truncate>
        {fileUrl}
      </Link>
    </Flex>
  );
}
