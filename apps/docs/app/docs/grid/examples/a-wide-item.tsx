import { Box, Grid, TextArea, TextField } from '@kushagradhawan/kookie-ui';

export default function ProfileForm() {
  return (
    <Grid columns="2" gap="4" width="100%" maxWidth="480px">
      <TextField.Root aria-label="First name" placeholder="First name" />
      <TextField.Root aria-label="Last name" placeholder="Last name" />
      <Box gridColumn="1 / -1">
        <TextArea aria-label="Bio" placeholder="A few words about you" />
      </Box>
    </Grid>
  );
}
