import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { bench, describe } from 'vitest';

import {
  Avatar,
  Badge,
  Blockquote,
  Box,
  Button,
  Callout,
  Card,
  Checkbox,
  Code,
  Container,
  DataList,
  Flex,
  Grid,
  Heading,
  IconButton,
  Kbd,
  Link,
  Progress,
  RadioGroup,
  SegmentedControl,
  Select,
  Separator,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Text,
  TextArea,
  TextField,
  Theme,
  Tooltip,
} from '../src/components/index';

/**
 * Renders each component 100 times inside one theme, so the per-component cost
 * is visible above the fixed cost of the provider.
 */
function many(node: (i: number) => React.ReactNode, count = 100) {
  return renderToString(
    <Theme>
      {Array.from({ length: count }, (_, i) => (
        <React.Fragment key={i}>{node(i)}</React.Fragment>
      ))}
    </Theme>,
  );
}

describe('component render cost (x100)', () => {
  bench('Box', () => void many(() => <Box p="2" />));
  bench('Flex', () => void many(() => <Flex align="center" gap="2" p="2" />));
  bench('Grid', () => void many(() => <Grid columns="3" gap="2" />));
  bench('Container', () => void many(() => <Container size="2" />));
  bench('Text', () => void many((i) => <Text size="2">row {i}</Text>));
  bench('Heading', () => void many((i) => <Heading size="3">row {i}</Heading>));
  bench('Link', () => void many(() => <Link href="#x">link</Link>));
  bench('Code', () => void many(() => <Code>code</Code>));
  bench('Blockquote', () => void many(() => <Blockquote>quote</Blockquote>));
  bench('Kbd', () => void many(() => <Kbd>K</Kbd>));
  bench(
    'Button',
    () =>
      void many(() => (
        <Button size="2" variant="classic">
          Save
        </Button>
      )),
  );
  bench('IconButton', () => void many(() => <IconButton size="2" aria-label="a" />));
  bench('Badge', () => void many(() => <Badge variant="soft">Active</Badge>));
  bench('Card', () => void many(() => <Card variant="classic">body</Card>));
  bench(
    'Callout',
    () =>
      void many(() => (
        <Callout.Root>
          <Callout.Text>note</Callout.Text>
        </Callout.Root>
      )),
  );
  bench('Avatar', () => void many(() => <Avatar fallback="A" />));
  bench('Separator', () => void many(() => <Separator size="2" />));
  bench('Spinner', () => void many(() => <Spinner size="2" />));
  bench('Skeleton', () => void many(() => <Skeleton width="80px" height="16px" />));
  bench('Progress', () => void many(() => <Progress value={40} />));
  bench('Checkbox', () => void many(() => <Checkbox />));
  bench('Switch', () => void many(() => <Switch />));
  bench('Slider', () => void many(() => <Slider defaultValue={[50]} />));
  bench('TextField', () => void many(() => <TextField.Root size="2" />));
  bench('TextArea', () => void many(() => <TextArea size="2" />));
  bench(
    'Tooltip',
    () =>
      void many(() => (
        <Tooltip content="tip">
          <button type="button">t</button>
        </Tooltip>
      )),
  );
  bench(
    'SegmentedControl',
    () =>
      void many(() => (
        <SegmentedControl.Root defaultValue="a">
          <SegmentedControl.Item value="a">A</SegmentedControl.Item>
          <SegmentedControl.Item value="b">B</SegmentedControl.Item>
        </SegmentedControl.Root>
      )),
  );
  bench(
    'RadioGroup',
    () =>
      void many(() => (
        <RadioGroup.Root defaultValue="a">
          <RadioGroup.Item value="a">A</RadioGroup.Item>
          <RadioGroup.Item value="b">B</RadioGroup.Item>
        </RadioGroup.Root>
      )),
  );
  bench(
    'Select',
    () =>
      void many(() => (
        <Select.Root defaultValue="a">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">A</Select.Item>
          </Select.Content>
        </Select.Root>
      )),
  );
  bench(
    'Tabs',
    () =>
      void many(() => (
        <Tabs.Root defaultValue="a">
          <Tabs.List>
            <Tabs.Trigger value="a">A</Tabs.Trigger>
            <Tabs.Trigger value="b">B</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="a">a</Tabs.Content>
        </Tabs.Root>
      )),
  );
  bench(
    'DataList',
    () =>
      void many(() => (
        <DataList.Root>
          <DataList.Item>
            <DataList.Label>Label</DataList.Label>
            <DataList.Value>Value</DataList.Value>
          </DataList.Item>
        </DataList.Root>
      )),
    { iterations: 20 },
  );
  bench(
    'Table row',
    () =>
      void renderToString(
        <Theme>
          <Table.Root>
            <Table.Body>
              {Array.from({ length: 100 }, (_, i) => (
                <Table.Row key={i}>
                  <Table.Cell>a</Table.Cell>
                  <Table.Cell>b</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Theme>,
      ),
  );
  bench('Theme only (baseline)', () => void many(() => null));
});
