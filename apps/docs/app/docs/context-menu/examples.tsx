'use client';

import * as React from 'react';
import { PreviewBlock } from '@/components/blocks/preview-block/preview-block';
import { SectionHeader } from '@/components/blocks/section-header/section-header';
import { Avatar, Card, ContextMenu, Flex, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Delete01Icon, Download01Icon, PencilEdit01Icon, Share01Icon } from '@hugeicons/core-free-icons';

const fileActionsCode = `<ContextMenu.Root>
  <ContextMenu.Trigger>
    <Card variant="classic" size="2">
      <Flex gap="3" align="center">
        <Avatar fallback="Q" size="2" color="blue" />
        <Flex direction="column">
          <Text size="2" weight="medium">
            Q3 Report.pdf
          </Text>
          <Text size="1" color="gray">
            Right-click for actions
          </Text>
        </Flex>
      </Flex>
    </Card>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item shortcut="⏎">
      <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.75} />
      Rename
    </ContextMenu.Item>
    <ContextMenu.Item shortcut="⌘ D">
      <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
      Duplicate
    </ContextMenu.Item>
    <ContextMenu.Item>
      <HugeiconsIcon icon={Download01Icon} strokeWidth={1.75} />
      Download
    </ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item color="red" shortcut="⌘ ⌫">
      <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.75} />
      Move to trash
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>`;

function FileActions() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Card variant="classic" size="2">
          <Flex gap="3" align="center">
            <Avatar fallback="Q" size="2" color="blue" />
            <Flex direction="column">
              <Text size="2" weight="medium">
                Q3 Report.pdf
              </Text>
              <Text size="1" color="gray">
                Right-click for actions
              </Text>
            </Flex>
          </Flex>
        </Card>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item shortcut="⏎">
          <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.75} />
          Rename
        </ContextMenu.Item>
        <ContextMenu.Item shortcut="⌘ D">
          <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
          Duplicate
        </ContextMenu.Item>
        <ContextMenu.Item>
          <HugeiconsIcon icon={Download01Icon} strokeWidth={1.75} />
          Download
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item color="red" shortcut="⌘ ⌫">
          <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.75} />
          Move to trash
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

const canvasOptionsCode = `const [showGrid, setShowGrid] = React.useState(true);
const [snap, setSnap] = React.useState(false);
const [zoom, setZoom] = React.useState('fit');

<ContextMenu.Root>
  <ContextMenu.Trigger>
    <Card variant="classic" size="2">
      <Text size="2" color="gray">
        Canvas · zoom {zoom}
      </Text>
    </Card>
  </ContextMenu.Trigger>
  <ContextMenu.Content size="1" variant="soft">
    <ContextMenu.Label>View</ContextMenu.Label>
    <ContextMenu.CheckboxItem
      checked={showGrid}
      onCheckedChange={setShowGrid}
      shortcut="⌘ '"
    >
      Show grid
    </ContextMenu.CheckboxItem>
    <ContextMenu.CheckboxItem
      checked={snap}
      onCheckedChange={setSnap}
      shortcut="⇧ S"
    >
      Snap to grid
    </ContextMenu.CheckboxItem>
    <ContextMenu.Separator />
    <ContextMenu.Label>Zoom</ContextMenu.Label>
    <ContextMenu.RadioGroup value={zoom} onValueChange={setZoom}>
      <ContextMenu.RadioItem value="fit">Fit</ContextMenu.RadioItem>
      <ContextMenu.RadioItem value="100%">100%</ContextMenu.RadioItem>
      <ContextMenu.RadioItem value="200%">200%</ContextMenu.RadioItem>
    </ContextMenu.RadioGroup>
  </ContextMenu.Content>
</ContextMenu.Root>`;

function CanvasOptions() {
  const [showGrid, setShowGrid] = React.useState(true);
  const [snap, setSnap] = React.useState(false);
  const [zoom, setZoom] = React.useState('fit');

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Card variant="classic" size="2">
          <Text size="2" color="gray">
            Canvas · zoom {zoom}
          </Text>
        </Card>
      </ContextMenu.Trigger>
      <ContextMenu.Content size="1" variant="soft">
        <ContextMenu.Label>View</ContextMenu.Label>
        <ContextMenu.CheckboxItem checked={showGrid} onCheckedChange={setShowGrid} shortcut="⌘ '">
          Show grid
        </ContextMenu.CheckboxItem>
        <ContextMenu.CheckboxItem checked={snap} onCheckedChange={setSnap} shortcut="⇧ S">
          Snap to grid
        </ContextMenu.CheckboxItem>
        <ContextMenu.Separator />
        <ContextMenu.Label>Zoom</ContextMenu.Label>
        <ContextMenu.RadioGroup value={zoom} onValueChange={setZoom}>
          <ContextMenu.RadioItem value="fit">Fit</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="100%">100%</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="200%">200%</ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

const layerActionsCode = `<ContextMenu.Root>
  <ContextMenu.Trigger>
    <Card variant="classic" size="2">
      <Text size="2">Header layer</Text>
    </Card>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item shortcut="⌘ D">Duplicate</ContextMenu.Item>
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger>Arrange</ContextMenu.SubTrigger>
      <ContextMenu.SubContent>
        <ContextMenu.Item shortcut="⌘ ⇧ ]">Bring to front</ContextMenu.Item>
        <ContextMenu.Item shortcut="⌘ ]">Bring forward</ContextMenu.Item>
        <ContextMenu.Item shortcut="⌘ [">Send backward</ContextMenu.Item>
        <ContextMenu.Item shortcut="⌘ ⇧ [">Send to back</ContextMenu.Item>
      </ContextMenu.SubContent>
    </ContextMenu.Sub>
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger>
        <HugeiconsIcon icon={Share01Icon} strokeWidth={1.75} />
        Export as
      </ContextMenu.SubTrigger>
      <ContextMenu.SubContent>
        <ContextMenu.Item>PNG</ContextMenu.Item>
        <ContextMenu.Item>SVG</ContextMenu.Item>
        <ContextMenu.Item disabled>PDF</ContextMenu.Item>
      </ContextMenu.SubContent>
    </ContextMenu.Sub>
    <ContextMenu.Separator />
    <ContextMenu.Item color="red">Delete layer</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>`;

function LayerActions() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Card variant="classic" size="2">
          <Text size="2">Header layer</Text>
        </Card>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item shortcut="⌘ D">Duplicate</ContextMenu.Item>
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger>Arrange</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item shortcut="⌘ ⇧ ]">Bring to front</ContextMenu.Item>
            <ContextMenu.Item shortcut="⌘ ]">Bring forward</ContextMenu.Item>
            <ContextMenu.Item shortcut="⌘ [">Send backward</ContextMenu.Item>
            <ContextMenu.Item shortcut="⌘ ⇧ [">Send to back</ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger>
            <HugeiconsIcon icon={Share01Icon} strokeWidth={1.75} />
            Export as
          </ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item>PNG</ContextMenu.Item>
            <ContextMenu.Item>SVG</ContextMenu.Item>
            <ContextMenu.Item disabled>PDF</ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>
        <ContextMenu.Separator />
        <ContextMenu.Item color="red">Delete layer</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

export function ContextMenuExamples() {
  return (
    <Flex direction="column" gap="9">
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>File Actions</SectionHeader.Title>
            <SectionHeader.Description>
              Right-click a file for its common actions. Shortcuts show the faster path, and the destructive action sits below a separator in red.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock background="none" height="20rem" code={fileActionsCode}>
          <FileActions />
        </PreviewBlock>
      </Flex>

      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Canvas View Options</SectionHeader.Title>
            <SectionHeader.Description>
              A compact soft menu for an editor canvas. Checkbox items toggle view settings and a radio group picks the zoom level; the menu stays in sync with state.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock background="none" height="20rem" code={canvasOptionsCode}>
          <CanvasOptions />
        </PreviewBlock>
      </Flex>

      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Layer Arrangement</SectionHeader.Title>
            <SectionHeader.Description>
              Submenus group related commands. They open to the side with Arrow Right and line their first item up with the trigger.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock background="none" height="20rem" code={layerActionsCode}>
          <LayerActions />
        </PreviewBlock>
      </Flex>
    </Flex>
  );
}
