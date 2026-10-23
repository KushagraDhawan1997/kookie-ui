'use client';

import * as React from 'react';
import { Shell, Button, Flex, Box, Text, Heading, Chip, Separator, Code } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Menu01Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
  ArrowDown01Icon,
  Home01Icon,
  Search01Icon,
  Settings01Icon,
  Notification01Icon,
} from '@hugeicons/core-free-icons';

type PaneLog = {
  id: number;
  timestamp: string;
  pane: string;
  event: string;
  detail?: string;
};

let logId = 0;
function createLog(pane: string, event: string, detail?: string): PaneLog {
  return {
    id: ++logId,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
    pane,
    event,
    detail,
  };
}

export default function ShellControlledTest() {
  const [railOpen, setRailOpen] = React.useState(true);
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [inspectorOpen, setInspectorOpen] = React.useState(false);
  const [bottomOpen, setBottomOpen] = React.useState(false);

  const [logs, setLogs] = React.useState<PaneLog[]>([]);
  const logEndRef = React.useRef<HTMLDivElement>(null);

  const addLog = React.useCallback((pane: string, event: string, detail?: string) => {
    setLogs((prev) => {
      const next = [...prev, createLog(pane, event, detail)];
      return next.length > 50 ? next.slice(-50) : next;
    });
  }, []);

  React.useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRailOpenChange = React.useCallback(
    (open: boolean, meta: { reason: string }) => {
      addLog('Rail', 'onOpenChange', `open=${open}, reason=${meta.reason}`);
      setRailOpen(open);
    },
    [addLog],
  );

  const handlePanelOpenChange = React.useCallback(
    (open: boolean, meta: { reason: string }) => {
      addLog('Panel', 'onOpenChange', `open=${open}, reason=${meta.reason}`);
      setPanelOpen(open);
    },
    [addLog],
  );

  const handleInspectorOpenChange = React.useCallback(
    (open: boolean, meta: { reason: string }) => {
      addLog('Inspector', 'onOpenChange', `open=${open}, reason=${meta.reason}`);
      setInspectorOpen(open);
    },
    [addLog],
  );

  const handleBottomOpenChange = React.useCallback(
    (open: boolean, meta: { reason: string }) => {
      addLog('Bottom', 'onOpenChange', `open=${open}, reason=${meta.reason}`);
      setBottomOpen(open);
    },
    [addLog],
  );

  const clearLogs = React.useCallback(() => setLogs([]), []);

  const handleRailExpand = React.useCallback(() => addLog('Rail', 'onExpand'), [addLog]);
  const handleRailCollapse = React.useCallback(() => addLog('Rail', 'onCollapse'), [addLog]);
  const handlePanelExpand = React.useCallback(() => addLog('Panel', 'onExpand'), [addLog]);
  const handlePanelCollapse = React.useCallback(() => addLog('Panel', 'onCollapse'), [addLog]);
  const handlePanelResize = React.useCallback((size: number) => addLog('Panel', 'onResize', `size=${size}px`), [addLog]);
  const handlePanelResizeStart = React.useCallback((size: number) => addLog('Panel', 'onResizeStart', `size=${size}px`), [addLog]);
  const handlePanelResizeEnd = React.useCallback((size: number) => addLog('Panel', 'onResizeEnd', `size=${size}px`), [addLog]);
  const handleInspectorExpand = React.useCallback(() => addLog('Inspector', 'onExpand'), [addLog]);
  const handleInspectorCollapse = React.useCallback(() => addLog('Inspector', 'onCollapse'), [addLog]);
  const handleInspectorResize = React.useCallback((size: number) => addLog('Inspector', 'onResize', `size=${size}px`), [addLog]);
  const handleInspectorResizeEnd = React.useCallback((size: number) => addLog('Inspector', 'onResizeEnd', `size=${size}px`), [addLog]);
  const handleBottomExpand = React.useCallback(() => addLog('Bottom', 'onExpand'), [addLog]);
  const handleBottomCollapse = React.useCallback(() => addLog('Bottom', 'onCollapse'), [addLog]);
  const handleBottomResize = React.useCallback((size: number) => addLog('Bottom', 'onResize', `size=${size}px`), [addLog]);
  const handleBottomResizeEnd = React.useCallback((size: number) => addLog('Bottom', 'onResizeEnd', `size=${size}px`), [addLog]);

  const stateColor = (open: boolean) => (open ? 'green' : 'gray');

  return (
    <Shell.Root height="100vh">
      <Shell.Header height={48}>
        <Flex align="center" justify="between" px="5" height="100%">
          <Flex align="center" gap="4">
            <Button iconOnly aria-label="Toggle rail" variant="ghost" size="2" color="gray" asChild>
              <Shell.Trigger target="rail">
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
              </Shell.Trigger>
            </Button>
            <Heading size="3">Shell Controlled Test</Heading>
          </Flex>
          <Flex align="center" gap="3">
            <Chip size="1" color={stateColor(railOpen)}>Rail: {railOpen ? 'open' : 'closed'}</Chip>
            <Chip size="1" color={stateColor(panelOpen)}>Panel: {panelOpen ? 'open' : 'closed'}</Chip>
            <Chip size="1" color={stateColor(inspectorOpen)}>Inspector: {inspectorOpen ? 'open' : 'closed'}</Chip>
            <Chip size="1" color={stateColor(bottomOpen)}>Bottom: {bottomOpen ? 'open' : 'closed'}</Chip>
          </Flex>
        </Flex>
      </Shell.Header>

      <Shell.Rail
        open={railOpen}
        onOpenChange={handleRailOpenChange}
        expandedSize={56}
        presentation={{ initial: 'overlay', md: 'fixed' }}
        onExpand={handleRailExpand}
        onCollapse={handleRailCollapse}
      >
        <Flex direction="column" gap="2" p="3" align="center" height="100%">
          <Button iconOnly aria-label="Toggle panel" variant="ghost" size="2" color="gray" asChild>
            <Shell.Trigger target="panel">
              <HugeiconsIcon icon={SidebarLeft01Icon} strokeWidth={1.75} />
            </Shell.Trigger>
          </Button>
          <Box my="2">
            <Separator />
          </Box>
          <Button iconOnly variant="ghost" size="2" color="gray" aria-label="Home">
            <HugeiconsIcon icon={Home01Icon} strokeWidth={1.75} />
          </Button>
          <Button iconOnly variant="ghost" size="2" color="gray" aria-label="Search">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
          </Button>
          <Button iconOnly variant="ghost" size="2" color="gray" aria-label="Notifications">
            <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.75} />
          </Button>
          <Box style={{ flex: 1 }} />
          <Button iconOnly variant="ghost" size="2" color="gray" aria-label="Settings">
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
          </Button>
        </Flex>
      </Shell.Rail>

      <Shell.Panel
        open={panelOpen}
        onOpenChange={handlePanelOpenChange}
        expandedSize={260}
        resizable
        minSize={200}
        maxSize={400}
        onExpand={handlePanelExpand}
        onCollapse={handlePanelCollapse}
        onResize={handlePanelResize}
        onResizeStart={handlePanelResizeStart}
        onResizeEnd={handlePanelResizeEnd}
      >
        <Flex direction="column" p="4" gap="4" height="100%">
          <Flex align="center" justify="between">
            <Heading size="3">Panel</Heading>
            <Button iconOnly aria-label="Toggle panel" variant="ghost" size="1" color="gray" asChild>
              <Shell.Trigger target="panel" action="collapse">
                <HugeiconsIcon icon={SidebarLeft01Icon} strokeWidth={1.75} />
              </Shell.Trigger>
            </Button>
          </Flex>
          <Separator />
          <Flex direction="column" gap="2">
            {['Dashboard', 'Projects', 'Tasks', 'Calendar', 'Reports'].map((item) => (
              <Button key={item} variant="ghost" size="2" color="gray" style={{ justifyContent: 'flex-start' }}>
                {item}
              </Button>
            ))}
          </Flex>
          <Box style={{ flex: 1 }} />
          <Text size="1" emphasis="medium">Controlled: open={String(panelOpen)}</Text>
        </Flex>
      </Shell.Panel>

      <Shell.Content>
        <Box p="6" height="100%" style={{ overflow: 'auto' }}>
          <Box mb="5">
            <Heading size="5">Controlled Shell Test</Heading>
          </Box>

          <Box mb="6">
            <Text size="2" emphasis="medium">
              All panes are fully controlled via <Code>open</Code> + <Code>onOpenChange</Code>.
              Every state change flows through React state and is logged below.
            </Text>
          </Box>

          {/* Controlled state toggles */}
          <Box mb="6" p="5" style={{ background: 'var(--neutral-a3)', borderRadius: 'var(--radius-3)' }}>
            <Box mb="4">
              <Heading size="3">Direct State Controls</Heading>
            </Box>
            <Box mb="4">
              <Text size="2" emphasis="medium">
                These buttons call setState directly, bypassing Shell.Trigger.
                The controlled <Code>open</Code> prop should sync the pane to the new state.
              </Text>
            </Box>
            <Flex gap="3" wrap="wrap">
              <Button size="2" variant={railOpen ? 'solid' : 'outline'} color="blue" onClick={() => { setRailOpen((v) => !v); addLog('Rail', 'setState', `open=${!railOpen}`); }}>
                Rail: {railOpen ? 'Close' : 'Open'}
              </Button>
              <Button size="2" variant={panelOpen ? 'solid' : 'outline'} color="violet" onClick={() => { setPanelOpen((v) => !v); addLog('Panel', 'setState', `open=${!panelOpen}`); }}>
                Panel: {panelOpen ? 'Close' : 'Open'}
              </Button>
              <Button size="2" variant={inspectorOpen ? 'solid' : 'outline'} color="orange" onClick={() => { setInspectorOpen((v) => !v); addLog('Inspector', 'setState', `open=${!inspectorOpen}`); }}>
                Inspector: {inspectorOpen ? 'Close' : 'Open'}
              </Button>
              <Button size="2" variant={bottomOpen ? 'solid' : 'outline'} color="crimson" onClick={() => { setBottomOpen((v) => !v); addLog('Bottom', 'setState', `open=${!bottomOpen}`); }}>
                Bottom: {bottomOpen ? 'Close' : 'Open'}
              </Button>
            </Flex>
          </Box>

          {/* Shell.Trigger controls */}
          <Box mb="6" p="5" style={{ background: 'var(--blue-a3)', borderRadius: 'var(--radius-3)' }}>
            <Box mb="4">
              <Heading size="3">Shell.Trigger Controls</Heading>
            </Box>
            <Box mb="4">
              <Text size="2" emphasis="medium">
                These use <Code>Shell.Trigger</Code> with various actions.
                In controlled mode, the trigger should call <Code>onOpenChange</Code> which updates state.
              </Text>
            </Box>
            <Flex gap="3" wrap="wrap" mb="4">
              <Text size="2" weight="medium" style={{ width: '100%' }}>Toggle:</Text>
              <Button size="2" variant="soft" color="gray" asChild>
                <Shell.Trigger target="rail">Rail</Shell.Trigger>
              </Button>
              <Button size="2" variant="soft" color="gray" asChild>
                <Shell.Trigger target="panel">Panel</Shell.Trigger>
              </Button>
              <Button size="2" variant="soft" color="gray" asChild>
                <Shell.Trigger target="inspector">Inspector</Shell.Trigger>
              </Button>
              <Button size="2" variant="soft" color="gray" asChild>
                <Shell.Trigger target="bottom">Bottom</Shell.Trigger>
              </Button>
            </Flex>
            <Flex gap="3" wrap="wrap" mb="4">
              <Text size="2" weight="medium" style={{ width: '100%' }}>Expand:</Text>
              <Button size="1" variant="outline" color="green" asChild>
                <Shell.Trigger target="rail" action="expand">Rail</Shell.Trigger>
              </Button>
              <Button size="1" variant="outline" color="green" asChild>
                <Shell.Trigger target="panel" action="expand">Panel</Shell.Trigger>
              </Button>
              <Button size="1" variant="outline" color="green" asChild>
                <Shell.Trigger target="inspector" action="expand">Inspector</Shell.Trigger>
              </Button>
              <Button size="1" variant="outline" color="green" asChild>
                <Shell.Trigger target="bottom" action="expand">Bottom</Shell.Trigger>
              </Button>
            </Flex>
            <Flex gap="3" wrap="wrap">
              <Text size="2" weight="medium" style={{ width: '100%' }}>Collapse:</Text>
              <Button size="1" variant="outline" color="red" asChild>
                <Shell.Trigger target="rail" action="collapse">Rail</Shell.Trigger>
              </Button>
              <Button size="1" variant="outline" color="red" asChild>
                <Shell.Trigger target="panel" action="collapse">Panel</Shell.Trigger>
              </Button>
              <Button size="1" variant="outline" color="red" asChild>
                <Shell.Trigger target="inspector" action="collapse">Inspector</Shell.Trigger>
              </Button>
              <Button size="1" variant="outline" color="red" asChild>
                <Shell.Trigger target="bottom" action="collapse">Bottom</Shell.Trigger>
              </Button>
            </Flex>
          </Box>

          {/* Independence test: since 0.8.0 the Rail and the Panel do not drive each other */}
          <Box mb="6" p="5" style={{ background: 'var(--amber-a3)', borderRadius: 'var(--radius-3)' }}>
            <Box mb="4">
              <Heading size="3">Rail and Panel</Heading>
            </Box>
            <Box mb="4">
              <Text size="2" emphasis="medium">
                The Rail and the Panel are independent. Neither button below should change the other pane, and the log should show no callback.
              </Text>
            </Box>
            <Flex gap="3" wrap="wrap">
              <Button
                size="2"
                variant="raised"
                color="amber"
                onClick={() => {
                  addLog('Test', 'rail-close', 'Closing Rail — Panel should stay as it is');
                  setRailOpen(false);
                }}
              >
                Close Rail (Panel stays)
              </Button>
              <Button
                size="2"
                variant="raised"
                color="amber"
                onClick={() => {
                  addLog('Test', 'panel-open', 'Opening Panel — Rail should stay as it is');
                  setPanelOpen(true);
                }}
              >
                Open Panel (Rail stays)
              </Button>
              <Button
                size="2"
                variant="soft"
                color="gray"
                onClick={() => {
                  addLog('Test', 'reset', 'Resetting all panes to initial state');
                  setRailOpen(true);
                  setPanelOpen(true);
                  setInspectorOpen(false);
                  setBottomOpen(false);
                }}
              >
                Reset All
              </Button>
            </Flex>
          </Box>

          {/* Rapid toggle test */}
          <Box mb="6" p="5" style={{ background: 'var(--green-a3)', borderRadius: 'var(--radius-3)' }}>
            <Box mb="4">
              <Heading size="3">Stress Tests</Heading>
            </Box>
            <Box mb="4">
              <Text size="2" emphasis="medium">
                Rapid state changes to test for race conditions and stale closures.
              </Text>
            </Box>
            <Flex gap="3" wrap="wrap">
              <Button
                size="2"
                variant="raised"
                color="green"
                onClick={() => {
                  addLog('Test', 'rapid-toggle', 'Rapidly toggling all panes');
                  setRailOpen((v) => !v);
                  setPanelOpen((v) => !v);
                  setInspectorOpen((v) => !v);
                  setBottomOpen((v) => !v);
                }}
              >
                Toggle All Simultaneously
              </Button>
              <Button
                size="2"
                variant="raised"
                color="green"
                onClick={async () => {
                  addLog('Test', 'sequential', 'Sequential open: Rail → Panel → Inspector → Bottom');
                  setRailOpen(true);
                  await new Promise((r) => setTimeout(r, 100));
                  setPanelOpen(true);
                  await new Promise((r) => setTimeout(r, 100));
                  setInspectorOpen(true);
                  await new Promise((r) => setTimeout(r, 100));
                  setBottomOpen(true);
                }}
              >
                Open All Sequentially (100ms delay)
              </Button>
              <Button
                size="2"
                variant="soft"
                color="gray"
                onClick={() => {
                  addLog('Test', 'close-all', 'Closing all panes');
                  setRailOpen(false);
                  setPanelOpen(false);
                  setInspectorOpen(false);
                  setBottomOpen(false);
                }}
              >
                Close All
              </Button>
              <Button
                size="2"
                variant="soft"
                color="gray"
                onClick={() => {
                  addLog('Test', 'open-all', 'Opening all panes');
                  setRailOpen(true);
                  setPanelOpen(true);
                  setInspectorOpen(true);
                  setBottomOpen(true);
                }}
              >
                Open All
              </Button>
            </Flex>
          </Box>

          {/* Event Log */}
          <Box p="5" style={{ background: 'var(--neutral-a3)', borderRadius: 'var(--radius-3)' }}>
            <Flex align="center" justify="between" mb="4">
              <Heading size="3">Event Log ({logs.length})</Heading>
              <Button size="1" variant="soft" color="gray" onClick={clearLogs}>
                Clear
              </Button>
            </Flex>
            <Box
              style={{
                maxHeight: 300,
                overflow: 'auto',
                fontFamily: 'var(--code-font-family)',
                fontSize: 'var(--font-size-1)',
                lineHeight: '1.6',
                background: 'var(--neutral-1)',
                borderRadius: 'var(--radius-2)',
                padding: 'var(--space-3)',
              }}
            >
              {logs.length === 0 ? (
                <Text size="1" emphasis="medium">No events yet. Interact with the panes to see events.</Text>
              ) : (
                logs.map((log) => (
                  <Flex key={log.id} gap="3" align="baseline">
                    <Text size="1" emphasis="medium" style={{ fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                      {log.timestamp}
                    </Text>
                    <Chip size="1" color={
                      log.pane === 'Rail' ? 'blue' :
                      log.pane === 'Panel' ? 'violet' :
                      log.pane === 'Inspector' ? 'orange' :
                      log.pane === 'Bottom' ? 'crimson' :
                      'gray'
                    }>
                      {log.pane}
                    </Chip>
                    <Text size="1" weight="medium" style={{ fontFamily: 'inherit' }}>
                      {log.event}
                    </Text>
                    {log.detail && (
                      <Text size="1" emphasis="medium" style={{ fontFamily: 'inherit' }}>
                        {log.detail}
                      </Text>
                    )}
                  </Flex>
                ))
              )}
              <div ref={logEndRef} />
            </Box>
          </Box>
        </Box>
      </Shell.Content>

      <Shell.Inspector
        open={inspectorOpen}
        onOpenChange={handleInspectorOpenChange}
        expandedSize={280}
        presentation={{ initial: 'overlay', lg: 'fixed' }}
        resizable
        minSize={200}
        maxSize={450}
        onExpand={handleInspectorExpand}
        onCollapse={handleInspectorCollapse}
        onResize={handleInspectorResize}
        onResizeEnd={handleInspectorResizeEnd}
      >
        <Flex direction="column" p="4" gap="4" height="100%">
          <Flex align="center" justify="between">
            <Heading size="3">Inspector</Heading>
            <Button iconOnly aria-label="Toggle inspector" variant="ghost" size="1" color="gray" asChild>
              <Shell.Trigger target="inspector" action="collapse">
                <HugeiconsIcon icon={SidebarRight01Icon} strokeWidth={1.75} />
              </Shell.Trigger>
            </Button>
          </Flex>
          <Separator />
          <Flex direction="column" gap="4">
            <Box>
              <Box mb="2">
                <Text size="2" weight="medium">Properties</Text>
              </Box>
              <Text size="1" emphasis="medium">Selected item properties would appear here.</Text>
            </Box>
            <Separator />
            <Box>
              <Box mb="2">
                <Text size="2" weight="medium">State Debug</Text>
              </Box>
              <Flex direction="column" gap="2">
                <Text size="1">Rail: <Code>{String(railOpen)}</Code></Text>
                <Text size="1">Panel: <Code>{String(panelOpen)}</Code></Text>
                <Text size="1">Inspector: <Code>{String(inspectorOpen)}</Code></Text>
                <Text size="1">Bottom: <Code>{String(bottomOpen)}</Code></Text>
              </Flex>
            </Box>
          </Flex>
          <Box style={{ flex: 1 }} />
          <Text size="1" emphasis="medium">Controlled: open={String(inspectorOpen)}</Text>
        </Flex>
      </Shell.Inspector>

      <Shell.Bottom
        open={bottomOpen}
        onOpenChange={handleBottomOpenChange}
        expandedSize={180}
        resizable
        minSize={100}
        maxSize={350}
        onExpand={handleBottomExpand}
        onCollapse={handleBottomCollapse}
        onResize={handleBottomResize}
        onResizeEnd={handleBottomResizeEnd}
      >
        <Flex direction="column" p="4" gap="3" height="100%">
          <Flex align="center" justify="between">
            <Flex align="center" gap="3">
              <Heading size="3">Terminal</Heading>
              <Chip size="1" color="green">Active</Chip>
            </Flex>
            <Flex gap="2">
              <Button iconOnly aria-label="Toggle bottom" variant="ghost" size="1" color="gray" asChild>
                <Shell.Trigger target="bottom" action="collapse">
                  <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.75} />
                </Shell.Trigger>
              </Button>
            </Flex>
          </Flex>
          <Box
            style={{
              flex: 1,
              fontFamily: 'var(--code-font-family)',
              fontSize: 'var(--font-size-1)',
              background: 'var(--neutral-1)',
              borderRadius: 'var(--radius-2)',
              padding: 'var(--space-3)',
              overflow: 'auto',
            }}
          >
            <Text size="1" style={{ fontFamily: 'inherit' }}>
              $ controlled shell test running...<br />
              Bottom panel open={String(bottomOpen)}<br />
              Ready for input.
            </Text>
          </Box>
        </Flex>
      </Shell.Bottom>
    </Shell.Root>
  );
}
