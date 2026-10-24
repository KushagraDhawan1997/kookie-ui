'use client';

import * as React from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ComputerIcon,
  PlayIcon,
  Redo02Icon,
  Search01Icon,
  SidebarLeftIcon,
  SidebarRightIcon,
  SmartPhone01Icon,
  SourceCodeIcon,
  Undo02Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  SegmentedControl,
  Select,
  Shell,
  Slider,
  Text,
  TextField,
  Theme,
  Toolbar,
} from '@kushagradhawan/kookie-ui';

/**
 * The front page's hero (2026-10-22): a real builder made with Womp's Design System, laid out like
 * the Kookie UI builder (layers, the canvas with floating toolbars, the inspector), standing on the
 * line grid and cropped by the band's bottom edge. The same figure is on kushagradhawan.com's
 * Womp's Design System page. DocsShell runs it to the content pane's top, left and right edges,
 * with the top bar floating over it.
 */
const icon = (glyph: IconSvgElement, size = 16) => <HugeiconsIcon icon={glyph} size={size} strokeWidth={1.5} aria-hidden />;

type Layer = { label: string; depth: number; open?: boolean; closed?: boolean; selected?: boolean };

/** The same tree as the v2 figure, with the same rows open. */
const LAYERS: readonly Layer[] = [
  { label: "Page", depth: 0, open: true },
  { label: "Card", depth: 1, open: true },
  { label: "Heading", depth: 2 },
  { label: "Text", depth: 2 },
  { label: "Field", depth: 2, open: true },
  { label: "FieldLabel", depth: 3 },
  { label: "TextField", depth: 3 },
  { label: "Field", depth: 2, closed: true },
  { label: "Flex", depth: 2, open: true },
  { label: "Button", depth: 3 },
  { label: "Button", depth: 3, selected: true },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap="2">
      <Text size="1" weight="medium">
        {label}
      </Text>
      {children}
    </Flex>
  );
}

function Choice({ value, items }: { value: string; items: readonly string[] }) {
  return (
    <Select.Root defaultValue={value} size="1">
      {/* The label is passed in, so the server HTML shows it before the list exists. */}
      <Select.Trigger>{value}</Select.Trigger>
      <Select.Content>
        {items.map((item) => (
          <Select.Item key={item} value={item}>
            {item}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}

/**
 * The same composition as the v2 figure: every pane takes its header from `Shell.PaneHeader` and a
 * `Toolbar`, the canvas toolbars float over the work area, and the lists scroll under them. The
 * controls sit one step smaller than the toolbars, the way the v2 figure's do.
 */
function Builder() {
  return (
    <Theme accentColor="gray" radius="full" className="kd-hero-window">
      <Shell.Root height="704px" size="1">
        <Shell.Sidebar defaultState="expanded" defaultSize={232} presentation="fixed">
          <Shell.PaneHeader>
            <Toolbar.Root backdrop>
              <SegmentedControl.Root defaultValue="layers" size="2">
                <SegmentedControl.Item value="layers">Layers</SegmentedControl.Item>
                <SegmentedControl.Item value="add">Add</SegmentedControl.Item>
              </SegmentedControl.Root>
              <Toolbar.Button iconOnly aria-label="Search">
                {icon(Search01Icon)}
              </Toolbar.Button>
            </Toolbar.Root>
          </Shell.PaneHeader>
          <Shell.Scroll fade>
            <Flex direction="column" gap="1">
              {LAYERS.map((layer, i) => (
                <Flex
                  key={i}
                  align="center"
                  gap="2"
                  py="2"
                  pr="3"
                  style={{
                    paddingInlineStart: 4 + layer.depth * 14,
                    borderRadius: 'var(--radius-full)',
                    background: layer.selected ? 'var(--neutral-a3)' : undefined,
                  }}
                >
                  <Box width="16px" style={{ color: 'var(--neutral-a10)', display: 'grid' }}>
                    {layer.open ? icon(ArrowDown01Icon, 14) : layer.closed ? icon(ArrowRight01Icon, 14) : null}
                  </Box>
                  <Text size="2">{layer.label}</Text>
                </Flex>
              ))}
            </Flex>
          </Shell.Scroll>
        </Shell.Sidebar>
        <Shell.Content>
          <Shell.PaneHeader float>
            <Toolbar.Root backdrop>
              <Flex align="center" gap="2">
                <Toolbar.Button iconOnly aria-label="Layers">
                  {icon(SidebarLeftIcon)}
                </Toolbar.Button>
                <Toolbar.Title>Sign in</Toolbar.Title>
              </Flex>
              <Flex align="center" gap="2">
                <Toolbar.Group>
                  <Toolbar.Button iconOnly aria-label="Desktop">
                    {icon(ComputerIcon)}
                  </Toolbar.Button>
                  <Toolbar.Button iconOnly aria-label="Phone">
                    {icon(SmartPhone01Icon)}
                  </Toolbar.Button>
                </Toolbar.Group>
                <Toolbar.Button iconOnly aria-label="Preview">
                  {icon(PlayIcon)}
                </Toolbar.Button>
                <Toolbar.Button variant="solid">Export</Toolbar.Button>
                <Toolbar.Button iconOnly aria-label="Inspector">
                  {icon(SidebarRightIcon)}
                </Toolbar.Button>
              </Flex>
            </Toolbar.Root>
          </Shell.PaneHeader>
          <Flex justify="center" className="kd-hero-canvas">
            <Card size="3" className="kd-hero-composition">
              <Flex direction="column" gap="5">
                <Flex direction="column" gap="2">
                  <Heading size="6">Sign in</Heading>
                  <Text size="3" color="gray">
                    Use the email for your workspace.
                  </Text>
                </Flex>
                <Flex direction="column" gap="4">
                  <Field label="Email">
                    <TextField.Root size="2" defaultValue="ada@kookie.studio" />
                  </Field>
                  <Field label="Password">
                    <TextField.Root size="2" type="password" defaultValue="kookie-ui" />
                  </Field>
                </Flex>
                <Flex gap="2" justify="end">
                  <Button variant="ghost" color="gray">
                    Cancel
                  </Button>
                  <Box className="kd-hero-selected">
                    <Button variant="solid">Continue</Button>
                  </Box>
                </Flex>
              </Flex>
            </Card>
          </Flex>
          <Shell.PaneFooter float>
            <Toolbar.Root backdrop>
              <Toolbar.Group>
                <Toolbar.Button iconOnly aria-label="Undo">
                  {icon(Undo02Icon)}
                </Toolbar.Button>
                <Toolbar.Button iconOnly aria-label="Redo">
                  {icon(Redo02Icon)}
                </Toolbar.Button>
              </Toolbar.Group>
              <Flex align="center" gap="2">
                <Toolbar.Button iconOnly aria-label="Show outlines">
                  {icon(ViewIcon)}
                </Toolbar.Button>
                <Toolbar.Button>100%</Toolbar.Button>
              </Flex>
            </Toolbar.Root>
          </Shell.PaneFooter>
        </Shell.Content>
        <Shell.Inspector defaultOpen defaultSize={272} presentation="fixed">
          <Shell.PaneHeader>
            <Toolbar.Root backdrop>
              <Toolbar.Title>Button</Toolbar.Title>
              <Toolbar.Button iconOnly aria-label="Show code">
                {icon(SourceCodeIcon)}
              </Toolbar.Button>
            </Toolbar.Root>
          </Shell.PaneHeader>
          <Shell.Scroll fade>
            <Flex direction="column" gap="5">
              <Field label="Label">
                <TextField.Root size="1" defaultValue="Continue" />
              </Field>
              <Field label="Size">
                <SegmentedControl.Root defaultValue="2" size="1">
                  <SegmentedControl.Item value="1">1</SegmentedControl.Item>
                  <SegmentedControl.Item value="2">2</SegmentedControl.Item>
                  <SegmentedControl.Item value="3">3</SegmentedControl.Item>
                  <SegmentedControl.Item value="4">4</SegmentedControl.Item>
                </SegmentedControl.Root>
              </Field>
              <Field label="Emphasis">
                <Choice value="Loud" items={['Quiet', 'Medium', 'Loud']} />
              </Field>
              <Field label="Tone">
                <Choice value="Accent" items={['Accent', 'Neutral', 'Destructive']} />
              </Field>
              <Field label="Gap">
                <Slider size="1" defaultValue={[40]} aria-label="Gap" />
              </Field>
            </Flex>
          </Shell.Scroll>
        </Shell.Inspector>
      </Shell.Root>
    </Theme>
  );
}

/**
 * The hero sits under the title and the intro at every width, so the first screen says what the
 * page is (Kushagra, 2026-10-22). It breaks out of the reading column to the content pane's
 * edges.
 */
export function Hero() {
  return (
    <Box className="kd-hero" aria-hidden inert>
      <Box className="kd-hero-stage">
        <Builder />
      </Box>
    </Box>
  );
}
