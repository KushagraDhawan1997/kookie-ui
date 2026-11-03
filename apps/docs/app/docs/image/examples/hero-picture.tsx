import { Flex, Heading, Image, Text } from '@kushagradhawan/kookie-ui';

export default function ArticleHero() {
  return (
    <Flex direction="column" gap="3" width="100%">
      <Image
        src="/playground/image_large.jpg"
        alt="Curved white sculpture"
        width="100%"
        height={{ initial: '240px', md: '420px' }}
        loading="eager"
      />
      <Heading as="h2" size="5">Designing with less</Heading>
      <Text size="2" emphasis="medium">Six notes on restraint in interface design.</Text>
    </Flex>
  );
}
