import * as React from 'react';
import { Box, Card, ContextMenu, Text } from '@kushagradhawan/kookie-ui';

export default function CanvasMenu() {
  const [showGrid, setShowGrid] = React.useState(true);
  const [zoom, setZoom] = React.useState('fit');

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Box width="100%" maxWidth="320px">
          <Card size="3">
            <Text size="2" emphasis="medium">Right-click the canvas · zoom {zoom}</Text>
          </Card>
        </Box>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.CheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
          Show grid
        </ContextMenu.CheckboxItem>
        <ContextMenu.Separator />
        <ContextMenu.Label>Zoom</ContextMenu.Label>
        <ContextMenu.RadioGroup value={zoom} onValueChange={setZoom}>
          <ContextMenu.RadioItem value="fit">Fit to screen</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="100%">100%</ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
