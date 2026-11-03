import { Box, Heading } from '@kushagradhawan/kookie-ui';

export default function LaunchTitle() {
  return (
    <Box maxWidth="480px">
      <Heading
        as="h1"
        size="8"
        align="center"
        wrap="balance"
      >
        Plan, build and ship your next release
      </Heading>
    </Box>
  );
}
