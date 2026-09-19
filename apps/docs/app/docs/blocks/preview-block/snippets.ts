export const previewSources = {
  grid: `<PreviewBlock background="grid" label="Storage card" code={source}>
  <Card variant="classic" size="2">
    <Flex direction="column" gap="1" width="240px">
      <Text size="2" weight="medium">Storage</Text>
      <Text size="2" emphasis="medium">18.4 GB of 50 GB used</Text>
    </Flex>
  </Card>
</PreviewBlock>`,
  dark: `<PreviewBlock appearance="dark" showThemeToggle={false} code={source}>
  <Flex gap="2" align="center">
    <Badge color="green" variant="soft">Live</Badge>
    <Text size="2">Deployed 2 minutes ago</Text>
  </Flex>
</PreviewBlock>`,
  gradient: `<PreviewBlock
  showThemeToggle={false}
  background={{
    backgroundImage: 'linear-gradient(135deg, var(--iris-4), var(--pink-4))',
  }}
  code={source}
>
  <Button variant="soft" material="translucent">Action</Button>
</PreviewBlock>`,
};
