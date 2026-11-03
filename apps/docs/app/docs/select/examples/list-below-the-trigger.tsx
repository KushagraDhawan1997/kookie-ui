import { Select } from '@kushagradhawan/kookie-ui';

export default function SortSelect() {
  return (
    <Select.Root defaultValue="newest">
      <Select.Trigger aria-label="Sort by" />
      <Select.Content position="popper">
        <Select.Item value="newest">Newest first</Select.Item>
        <Select.Item value="oldest">Oldest first</Select.Item>
        <Select.Item value="name">Name</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}
