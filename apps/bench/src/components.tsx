import * as React from 'react';
import {
  Accordion,
  Avatar,
  Button,
  Card,
  Checkbox,
  Chip,
  Code,
  Dialog,
  DropdownMenu,
  Heading,
  Kbd,
  Notice,
  Popover,
  Progress,
  RadioGroup,
  ScrollArea,
  SegmentedControl,
  Select,
  Separator,
  Shell,
  Sidebar,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Text,
  TextArea,
  TextField,
  Toolbar,
  ToolbarButton,
  Tooltip,
} from '@kushagradhawan/kookie-ui';
import { useScene } from './harness';

/**
 * One component, mounted N times in a realistic minimal form, for the per-component profile.
 *
 *   ?scene=components&c=Button&n=200&state=rest|hover|open|focus
 *
 * Every instance's root (or its focusable part) carries data-inst="<i>". With state=open, only
 * instance 0 opens. The page's own layout lives in a class, never in a style attribute, so every
 * inline style the profile counts comes from the library.
 */

type Item = (i: number, open: boolean) => React.ReactElement;
interface Spec {
  /** Renders one instance. */
  item: Item;
  /** Wraps all instances, for components that only make sense inside a parent. */
  wrap?: (children: React.ReactNode, open: boolean) => React.ReactElement;
  /** The states worth measuring. */
  states: Array<'rest' | 'hover' | 'open' | 'focus'>;
}

const INTERACTIVE = ['rest', 'hover', 'focus'] as Spec['states'];
const STATIC = ['rest'] as Spec['states'];

export const COMPONENTS: Record<string, Spec> = {
  Button: { item: (i) => <Button data-inst={i}>Save</Button>, states: INTERACTIVE },
  IconButton: {
    item: (i) => (
      <Button data-inst={i} iconOnly aria-label="Add">
        +
      </Button>
    ),
    states: INTERACTIVE,
  },
  TextField: { item: (i) => <TextField.Root data-inst={i} placeholder="Name" aria-label="Name" />, states: INTERACTIVE },
  TextArea: { item: (i) => <TextArea data-inst={i} placeholder="Notes" aria-label="Notes" />, states: INTERACTIVE },
  Select: {
    item: (i, open) => (
      <Select.Root defaultValue="a" defaultOpen={open && i === 0}>
        <Select.Trigger data-inst={i} aria-label="Choice" />
        <Select.Content>
          <Select.Item value="a">Alpha</Select.Item>
          <Select.Item value="b">Beta</Select.Item>
          <Select.Item value="c">Gamma</Select.Item>
        </Select.Content>
      </Select.Root>
    ),
    states: ['rest', 'hover', 'focus', 'open'],
  },
  Checkbox: { item: (i) => <Checkbox data-inst={i} aria-label="Enable" defaultChecked={i % 2 === 0} />, states: INTERACTIVE },
  Radio: {
    item: (i) => (
      <RadioGroup.Item data-inst={i} value={String(i)}>
        Option {i}
      </RadioGroup.Item>
    ),
    wrap: (children) => (
      <RadioGroup.Root defaultValue="0" aria-label="Mode" className="bench-grid">
        {children}
      </RadioGroup.Root>
    ),
    states: INTERACTIVE,
  },
  Switch: { item: (i) => <Switch data-inst={i} aria-label="Sync" defaultChecked={i % 2 === 0} />, states: INTERACTIVE },
  Slider: { item: (i) => <Slider data-inst={i} aria-label="Level" defaultValue={[(i * 7) % 100]} />, states: INTERACTIVE },
  SegmentedControl: {
    item: (i) => (
      <SegmentedControl.Root data-inst={i} defaultValue="l">
        <SegmentedControl.Item value="l">Left</SegmentedControl.Item>
        <SegmentedControl.Item value="c">Center</SegmentedControl.Item>
        <SegmentedControl.Item value="r">Right</SegmentedControl.Item>
      </SegmentedControl.Root>
    ),
    states: INTERACTIVE,
  },
  Tabs: {
    item: (i) => (
      <Tabs.Root data-inst={i} defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">One</Tabs.Trigger>
          <Tabs.Trigger value="b">Two</Tabs.Trigger>
          <Tabs.Trigger value="c">Three</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel</Tabs.Content>
      </Tabs.Root>
    ),
    states: INTERACTIVE,
  },
  Card: {
    item: (i) => (
      <Card data-inst={i}>
        <Text>Metric {i}</Text>
      </Card>
    ),
    states: STATIC,
  },
  Chip: { item: (i) => <Chip data-inst={i} color={i % 2 ? 'green' : 'red'}>Active</Chip>, states: STATIC },
  Avatar: { item: (i) => <Avatar data-inst={i} size="2" fallback={String.fromCharCode(65 + (i % 26))} />, states: STATIC },
  Tooltip: {
    item: (i, open) => (
      <Tooltip content="Saved two minutes ago" defaultOpen={open && i === 0}>
        <Button data-inst={i} variant="ghost">
          Status
        </Button>
      </Tooltip>
    ),
    states: ['rest', 'hover', 'focus', 'open'],
  },
  DropdownMenu: {
    item: (i, open) => (
      <DropdownMenu.Root defaultOpen={open && i === 0}>
        <DropdownMenu.Trigger>
          <Button data-inst={i} variant="soft">
            Actions
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Edit</DropdownMenu.Item>
          <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item color="red">Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ),
    states: ['rest', 'hover', 'open'],
  },
  Dialog: {
    item: (i, open) => (
      <Dialog.Root defaultOpen={open && i === 0}>
        <Dialog.Trigger>
          <Button data-inst={i}>Edit</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>Change your name.</Dialog.Description>
          <TextField.Root defaultValue="Ada" aria-label="Name" />
          <Dialog.Close>
            <Button>Save</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    ),
    states: ['rest', 'open'],
  },
  Popover: {
    item: (i, open) => (
      <Popover.Root defaultOpen={open && i === 0}>
        <Popover.Trigger>
          <Button data-inst={i} variant="soft">
            Share
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <Text>Anyone with the link can view.</Text>
        </Popover.Content>
      </Popover.Root>
    ),
    states: ['rest', 'open'],
  },
  TableRow: {
    item: (i) => (
      <Table.Row key={i} data-inst={i}>
        <Table.RowHeaderCell>Person {i}</Table.RowHeaderCell>
        <Table.Cell>person{i}@example.com</Table.Cell>
        <Table.Cell>{(i * 7) % 50}</Table.Cell>
      </Table.Row>
    ),
    wrap: (children) => (
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Seats</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{children}</Table.Body>
      </Table.Root>
    ),
    states: ['rest', 'hover'],
  },
  ScrollArea: {
    item: (i) => (
      <ScrollArea data-inst={i} className="bench-scroll">
        <Text>
          Line one of {i}. Line two. Line three. Line four. Line five. Line six. Line seven. Line eight. Line nine.
        </Text>
      </ScrollArea>
    ),
    states: ['rest', 'hover'],
  },
  SidebarRow: {
    item: (i) => (
      <Sidebar.MenuItem key={i}>
        <Sidebar.MenuButton data-inst={i} isActive={i === 0}>
          <span className="kui-SidebarMenuLabel">Page {i}</span>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    ),
    wrap: (children) => (
      <Shell.Root height="100vh">
        <Shell.Sidebar defaultState="expanded" presentation="fixed">
          <Shell.Scroll role="navigation" aria-label="Main">
            <Sidebar.Group>
              <Sidebar.GroupLabel>Section</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>{children}</Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Shell.Scroll>
        </Shell.Sidebar>
        <Shell.Content>
          <Text>Content</Text>
        </Shell.Content>
      </Shell.Root>
    ),
    states: INTERACTIVE,
  },
  Toolbar: {
    item: (i) => (
      <Toolbar data-inst={i} aria-label="Tools">
        <ToolbarButton iconOnly aria-label="Bold">
          B
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Italic">
          I
        </ToolbarButton>
      </Toolbar>
    ),
    states: INTERACTIVE,
  },
  ToolbarBackdrop: {
    item: (i) => (
      <Toolbar data-inst={i} backdrop aria-label="Tools">
        <ToolbarButton iconOnly aria-label="Bold">
          B
        </ToolbarButton>
      </Toolbar>
    ),
    states: STATIC,
  },
  Notice: {
    item: (i) => (
      <Notice data-inst={i} action={<Button size="1">Add credits</Button>}>
        You are out of credits.
      </Notice>
    ),
    states: STATIC,
  },
  Accordion: {
    item: (i) => (
      <Accordion.Item key={i} value={String(i)} data-inst={i}>
        <Accordion.Header>
          <Accordion.Trigger>Question {i}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Answer {i}</Accordion.Content>
      </Accordion.Item>
    ),
    wrap: (children, open) => (
      <Accordion.Root type="multiple" defaultValue={open ? ['0'] : []}>
        {children}
      </Accordion.Root>
    ),
    states: ['rest', 'hover', 'open'],
  },
  Progress: { item: (i) => <Progress data-inst={i} value={(i * 13) % 100} />, states: STATIC },
  Spinner: { item: (i) => <Spinner data-inst={i} />, states: STATIC },
  Separator: { item: (i) => <Separator data-inst={i} size="4" />, states: STATIC },
  Text: { item: (i) => <Text data-inst={i}>Body text {i}</Text>, states: STATIC },
  Heading: { item: (i) => <Heading data-inst={i}>Heading {i}</Heading>, states: STATIC },
  Code: { item: (i) => <Code data-inst={i}>npm i</Code>, states: STATIC },
  Kbd: { item: (i) => <Kbd data-inst={i}>⌘K</Kbd>, states: STATIC },
};

const PAGE_CSS = `
.bench-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;padding:16px;align-items:start}
.bench-scroll{height:48px}
`;

export function ComponentsScene() {
  const params = new URLSearchParams(location.search);
  const name = params.get('c') ?? 'Button';
  const n = Number(params.get('n') ?? 1);
  const open = params.get('state') === 'open';
  const spec = COMPONENTS[name];
  const api = React.useMemo(() => ({ rerender: () => {} }), []);
  useScene(api);

  if (!spec) return <p>Unknown component. Try one of: {Object.keys(COMPONENTS).join(', ')}</p>;
  const items = Array.from({ length: n }, (_, i) => <React.Fragment key={i}>{spec.item(i, open)}</React.Fragment>);
  return (
    <>
      <style>{PAGE_CSS}</style>
      {spec.wrap ? spec.wrap(items, open) : <div className="bench-grid">{items}</div>}
    </>
  );
}
