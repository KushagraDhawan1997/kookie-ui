import { Chip, Flex } from '@kushagradhawan/kookie-ui';

const skills = ['Design systems', 'Prototyping', 'Accessibility', 'Motion', 'User research', 'Typography', 'React'];

export default function SkillTags() {
  return (
    <Flex wrap="wrap" gapX="2" gapY="3" maxWidth="360px">
      {skills.map((skill) => (
        <Chip key={skill} variant="outline" color="gray">{skill}</Chip>
      ))}
    </Flex>
  );
}
