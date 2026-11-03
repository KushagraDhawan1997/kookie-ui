import { Box, Button, Dialog, Flex, Image } from '@kushagradhawan/kookie-ui';

export default function WhatsNewDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>What's new</Button>
      </Dialog.Trigger>
      <Dialog.Content size="1">
        <Box mx="bleed" mt="bleed" mb="4">
          <Image src="/playground/image.jpg" alt="White sculpted ribbons" width="100%" height="180px" />
        </Box>
        <Dialog.Title>Shared folders</Dialog.Title>
        <Dialog.Description>Invite people to a folder and they see every file in it.</Dialog.Description>
        <Flex justify="end" mt="5">
          <Dialog.Close>
            <Button emphasis="loud">Got it</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
