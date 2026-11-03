import { Box, Card, Grid, Text } from '@kushagradhawan/kookie-ui';

const areas = [
  { area: 'header', label: 'Header' },
  { area: 'nav', label: 'Navigation' },
  { area: 'main', label: 'Main content' },
];

export default function AppLayout() {
  return (
    <Grid
      areas='"header header" "nav main"'
      columns="120px 1fr"
      rows="auto 1fr"
      gap="2"
      width="100%"
      height="240px"
    >
      {areas.map(({ area, label }) => (
        <Card key={area} asChild>
          <Box gridArea={area}>
            <Text size="2">{label}</Text>
          </Box>
        </Card>
      ))}
    </Grid>
  );
}
