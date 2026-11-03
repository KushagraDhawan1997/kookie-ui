import { Box, Card, Chip, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';

const skills = ['React', 'Node.js', 'TypeScript', 'GraphQL'];

export default function EngineerProfile() {
  return (
    <Box width="100%" maxWidth="320px">
      <Card>
        <Flex direction="column" gap="3">
          <Flex direction="column" gap="1">
            <Heading as="h3" size="3">Alex Lee</Heading>
            <Text size="2" emphasis="medium">Senior engineer</Text>
          </Flex>
          <Flex gap="2" wrap="wrap">
            {skills.map((skill) => (
              <Chip key={skill} variant="outline">{skill}</Chip>
            ))}
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
}
