import { Flex, Heading, Shell, Text, Toolbar } from '@kushagradhawan/kookie-ui';

const sections = ['Overview', 'Milestones', 'Budget', 'Risks', 'Team', 'Next steps'];

export default function ProjectBrief() {
  return (
    <Shell.Root height="360px">
      <Shell.Content>
        <Shell.PaneHeader float>
          <Toolbar backdrop aria-label="Page">
            <Toolbar.Title>Atlas brief</Toolbar.Title>
            <Toolbar.Button>Share</Toolbar.Button>
          </Toolbar>
        </Shell.PaneHeader>
        <Shell.Scroll fade>
          <Flex direction="column" gap="5" p="5">
            {sections.map((title) => (
              <Flex key={title} direction="column" gap="1">
                <Heading as="h3" size="3">{title}</Heading>
                <Text size="2" emphasis="medium">Notes for this part of the plan, kept short so the team reads them.</Text>
              </Flex>
            ))}
          </Flex>
        </Shell.Scroll>
      </Shell.Content>
    </Shell.Root>
  );
}
