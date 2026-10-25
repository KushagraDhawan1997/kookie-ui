import * as React from 'react';
import { Flex, Heading, Text, Toggle } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Archive01Icon } from '@hugeicons/core-free-icons';

const projects = [
  { name: 'Website redesign', archived: false },
  { name: 'Spring campaign', archived: true },
  { name: 'Mobile app', archived: false },
];

export default function ProjectList() {
  const [showArchived, setShowArchived] = React.useState(false);
  const visible = projects.filter((project) => showArchived || !project.archived);

  return (
    <Flex direction="column" gap="3" width="100%" maxWidth="320px">
      <Flex justify="between" align="center">
        <Heading as="h3" size="3">Projects</Heading>
        <Toggle emphasis="quiet" pressed={showArchived} onPressedChange={setShowArchived}>
          <HugeiconsIcon icon={Archive01Icon} strokeWidth={1.75} />
          Show archived
        </Toggle>
      </Flex>
      {visible.map((project) => (
        <Text key={project.name} size="2">{project.name}</Text>
      ))}
    </Flex>
  );
}
