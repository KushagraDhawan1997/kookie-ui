import { Select } from '@kushagradhawan/kookie-ui';

export default function OfficeSelect() {
  return (
    <Select.Root defaultValue="europe-london">
      <Select.Trigger aria-label="Office" />
      <Select.Content>
        <Select.Group>
          <Select.Label>Americas</Select.Label>
          <Select.Item value="america-new-york">New York</Select.Item>
          <Select.Item value="america-chicago">Chicago</Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.Label>Europe</Select.Label>
          <Select.Item value="europe-london">London</Select.Item>
          <Select.Item value="europe-berlin">Berlin</Select.Item>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}
