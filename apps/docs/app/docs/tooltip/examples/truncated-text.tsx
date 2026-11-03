import NextLink from 'next/link';
import { Box, Link, Tooltip } from '@kushagradhawan/kookie-ui';

const name = 'Brand guidelines for the 2026 spring launch.pdf';

export default function FileLink() {
  return (
    <Box maxWidth="200px">
      <Tooltip content={name}>
        <Link asChild size="2" truncate>
          <NextLink href="/docs/tooltip">{name}</NextLink>
        </Link>
      </Tooltip>
    </Box>
  );
}
