import { Grid, Image } from '@kushagradhawan/kookie-ui';

const photos = [
  { id: 'ribbons', url: '/playground/image.jpg', description: 'White sculpted ribbons' },
  { id: 'folds', url: '/playground/image_large.jpg', description: 'Curved white sculpture' },
  { id: 'curves', url: '/playground/image.jpg', description: 'Curved white forms in soft light' },
];

export default function PhotoGrid() {
  return (
    <Grid columns="3" gap="2" width="100%" maxWidth="480px">
      {photos.map((photo) => (
        <Image
          key={photo.id}
          src={photo.url}
          alt={photo.description}
          width="100%"
          height="160px"
        />
      ))}
    </Grid>
  );
}
