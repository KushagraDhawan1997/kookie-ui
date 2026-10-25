import { Combobox } from '@kushagradhawan/kookie-ui';

const projects: Record<string, string> = { atlas: 'Atlas', beacon: 'Beacon', compass: 'Compass' };
const projectName = (value: string | null) => (value ? projects[value] : undefined);

export default function ProjectPicker() {
  return (
    <Combobox.Root defaultValue="atlas" displayValue={projectName}>
      <Combobox.Trigger aria-label="Project" />
      <Combobox.Content>
        <Combobox.Input placeholder="Search projects" />
        <Combobox.List>
          <Combobox.Empty>No projects found</Combobox.Empty>
          <Combobox.Group>
            <Combobox.Label>Recent</Combobox.Label>
            <Combobox.Item value="atlas">Atlas</Combobox.Item>
          </Combobox.Group>
          <Combobox.Separator />
          <Combobox.Group>
            <Combobox.Label>All projects</Combobox.Label>
            <Combobox.Item value="beacon">Beacon</Combobox.Item>
            <Combobox.Item value="compass">Compass</Combobox.Item>
          </Combobox.Group>
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  );
}
