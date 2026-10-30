import { Box, Card, Grid, Text } from '@kushagradhawan/kookie-ui';

const photos = [
  { name: 'Harbour', span: 'span 2' },
  { name: 'Ridge', span: 'span 2' },
  { name: 'Dune', span: 'auto' },
  { name: 'Grove', span: 'auto' },
  { name: 'Delta', span: 'auto' },
];

export default function PhotoGallery() {
  return (
    <Grid columns="3" flow="dense" gap="2" width="100%" maxWidth="480px">
      {photos.map((photo) => (
        <Card key={photo.name} asChild>
          <Box gridColumn={photo.span}>
            <Text size="2">{photo.name}</Text>
          </Box>
        </Card>
      ))}
    </Grid>
  );
}
