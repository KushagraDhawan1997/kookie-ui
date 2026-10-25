import { Box, Button, Card, Flex, Text, TextField } from '@kushagradhawan/kookie-ui';

export default function SignInForm() {
  return (
    <Box width="100%" maxWidth="320px">
      <Card>
        <Flex direction="column" gap="3">
          <Text as="label" htmlFor="sign-in-email" size="2" weight="medium">
            Email
          </Text>
          <TextField.Root id="sign-in-email" type="email" placeholder="you@example.com" />
          <Button emphasis="loud" fullWidth>
            Send sign-in link
          </Button>
        </Flex>
      </Card>
    </Box>
  );
}
