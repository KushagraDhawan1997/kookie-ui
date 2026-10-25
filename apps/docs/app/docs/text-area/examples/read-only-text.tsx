import { Box, TextArea } from '@kushagradhawan/kookie-ui';

const log = `12:04:31 Installing dependencies
12:04:58 Building pages
12:05:12 Deployed to preview`;

export default function BuildLog() {
  return (
    <Box width="100%" maxWidth="360px">
      <TextArea aria-label="Build log" readOnly value={log} rows={3} resize="none" />
    </Box>
  );
}
