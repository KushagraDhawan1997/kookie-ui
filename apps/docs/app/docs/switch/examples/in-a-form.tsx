import * as React from 'react';
import { Box, Button, Flex, Switch, Text } from '@kushagradhawan/kookie-ui';

export default function NewsletterForm() {
  const [sent, setSent] = React.useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(String(new FormData(event.currentTarget).get('newsletter') ?? 'not sent'));
  }

  return (
    <form onSubmit={submit}>
      <Flex align="center" gap="4">
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Switch name="newsletter" value="yes" />
            Subscribe to the newsletter
          </Flex>
        </Text>
        <Button type="submit" emphasis="loud">Save</Button>
      </Flex>
      {sent && (
        <Box mt="2">
          <Text as="p" size="2" emphasis="medium">newsletter: {sent}</Text>
        </Box>
      )}
    </form>
  );
}
