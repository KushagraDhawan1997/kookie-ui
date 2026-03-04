'use client';

import * as React from 'react';
import { Shell, IconButton, Flex, Box, Text, Heading, Button, Badge, Separator, Code } from '@kushagradhawan/kookie-ui';
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
      if (!open && meta.reason === 'left') {
        addLog('Panel', 'cascade', 'Panel closed because Rail was collapsed');
      }
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
        <Flex align="center" justify="between" px="4" height="100%">
          <Flex align="center" gap="3">
            <IconButton variant="ghost" size="2" color="gray" highContrast asChild>
              <Shell.Trigger target="rail">
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
              </Shell.Trigger>
            </IconButton>
            <Heading size="3">Shell Controlled Test</Heading>
          </Flex>
          <Flex align="center" gap="2">
            <Badge size="1" color={stateColor(railOpen)}>Rail: {railOpen ? 'open' : 'closed'}</Badge>
            <Badge size="1" color={stateColor(panelOpen)}>Panel: {panelOpen ? 'open' : 'closed'}</Badge>
            <Badge size="1" color={stateColor(inspectorOpen)}>Inspector: {inspectorOpen ? 'open' : 'closed'}</Badge>
            <Badge size="1" color={stateColor(bottomOpen)}>Bottom: {bottomOpen ? 'open' : 'closed'}</Badge>
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
        <Flex direction="column" gap="1" p="2" align="center" height="100%">
          <IconButton variant="ghost" size="2" color="gray" highContrast asChild>
            <Shell.Trigger target="panel">
              <HugeiconsIcon icon={SidebarLeft01Icon} strokeWidth={1.75} />
            </Shell.Trigger>
          </IconButton>
          <Separator size="4" my="1" />
          <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Home">
            <HugeiconsIcon icon={Home01Icon} strokeWidth={1.75} />
          </IconButton>
          <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Search">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
          </IconButton>
          <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Notifications">
            <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.75} />
          </IconButton>
          <Box style={{ flex: 1 }} />
          <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Settings">
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
          </IconButton>
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
        <Flex direction="column" p="3" gap="3" height="100%">
          <Flex align="center" justify="between">
            <Heading size="3">Panel</Heading>
            <IconButton variant="ghost" size="1" color="gray" highContrast asChild>
              <Shell.Trigger target="panel" action="collapse">
                <HugeiconsIcon icon={SidebarLeft01Icon} strokeWidth={1.75} />
              </Shell.Trigger>
            </IconButton>
          </Flex>
          <Separator size="4" />
          <Flex direction="column" gap="1">
            {['Dashboard', 'Projects', 'Tasks', 'Calendar', 'Reports'].map((item) => (
              <Button key={item} variant="ghost" size="2" color="gray" highContrast style={{ justifyContent: 'flex-start' }}>
                {item}
              </Button>
            ))}
          </Flex>
          <Box style={{ flex: 1 }} />
          <Text size="1" color="gray">Controlled: open={String(panelOpen)}</Text>
        </Flex>
      </Shell.Panel>

      <Shell.Content>
        <Box p="5" height="100%" style={{ overflow: 'auto' }}>
          <Heading size="5" mb="4">Controlled Shell Test</Heading>

          <Text size="2" color="gray" mb="5">
            All panes are fully controlled via <Code>open</Code> + <Code>onOpenChange</Code>.
            Every state change flows through React state and is logged below.
          </Text>

          {/* Controlled state toggles */}
          <Box mb="5" p="4" style={{ background: 'var(--gray-a3)', borderRadius: 'var(--radius-3)' }}>
            <Heading size="3" mb="3">Direct State Controls</Heading>
            <Text size="2" color="gray" mb="3">
              These buttons call setState directly, bypassing Shell.Trigger.
              The controlled <Code>open</Code> prop should sync the pane to the new state.
            </Text>
            <Flex gap="2" wrap="wrap">
              <Button size="2" variant={railOpen ? 'solid' : 'outline'} color="blue" highContrast onClick={() => { setRailOpen((v) => !v); addLog('Rail', 'setState', `open=${!railOpen}`); }}>
                Rail: {railOpen ? 'Close' : 'Open'}
              </Button>
              <Button size="2" variant={panelOpen ? 'solid' : 'outline'} color="violet" highContrast onClick={() => { setPanelOpen((v) => !v); addLog('Panel', 'setState', `open=${!panelOpen}`); }}>
                Panel: {panelOpen ? 'Close' : 'Open'}
              </Button>
              <Button size="2" variant={inspectorOpen ? 'solid' : 'outline'} color="orange" highContrast onClick={() => { setInspectorOpen((v) => !v); addLog('Inspector', 'setState', `open=${!inspectorOpen}`); }}>
                Inspector: {inspectorOpen ? 'Close' : 'Open'}
              </Button>
              <Button size="2" variant={bottomOpen ? 'solid' : 'outline'} color="crimson" highContrast onClick={() => { setBottomOpen((v) => !v); addLog('Bottom', 'setState', `open=${!bottomOpen}`); }}>
                Bottom: {bottomOpen ? 'Close' : 'Open'}
              </Button>
            </Flex>
          </Box>

          {/* Shell.Trigger controls */}
          <Box mb="5" p="4" style={{ background: 'var(--blue-a3)', borderRadius: 'var(--radius-3)' }}>
            <Heading size="3" mb="3">Shell.Trigger Controls</Heading>
            <Text size="2" color="gray" mb="3">
              These use <Code>Shell.Trigger</Code> with various actions.
              In controlled mode, the trigger should call <Code>onOpenChange</Code> which updates state.
            </Text>
            <Flex gap="2" wrap="wrap" mb="3">
              <Text size="2" weight="medium" style={{ width: '100%' }}>Toggle:</Text>
              <Button size="2" variant="soft" color="gray" highContrast asChild>
                <Shell.Trigger target="rail">Rail</Shell.Trigger>
              </Button>
              <Button size="2" variant="soft" color="gray" highContrast asChild>
                <Shell.Trigger target="panel">Panel</Shell.Trigger>
              </Button>
              <Button size="2" variant="soft" color="gray" highContrast asChild>
                <Shell.Trigger target="inspector">Inspector</Shell.Trigger>
              </Button>
              <Button size="2" variant="soft" color="gray" highContrast asChild>
                <Shell.Trigger target="bottom">Bottom</Shell.Trigger>
              </Button>
            </Flex>
            <Flex gap="2" wrap="wrap" mb="3">
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
            <Flex gap="2" wrap="wrap">
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

          {/* Cascade test */}
          <Box mb="5" p="4" style={{ background: 'var(--amber-a3)', borderRadius: 'var(--radius-3)' }}>
            <Heading size="3" mb="3">Cascade Tests</Heading>
            <Text size="2" color="gray" mb="3">
              Test Rail→Panel cascade behavior in controlled mode.
            </Text>
            <Flex gap="2" wrap="wrap">
              <Button
                size="2"
                variant="classic"
                color="amber"
                highContrast
                onClick={() => {
                  addLog('Test', 'cascade-close', 'Closing Rail — Panel should cascade close');
                  setRailOpen(false);
                }}
              >
                Close Rail (should cascade Panel)
              </Button>
              <Button
                size="2"
                variant="classic"
                color="amber"
                highContrast
                onClick={() => {
                  addLog('Test', 'cascade-open', 'Opening Panel — Rail should auto-open');
                  setPanelOpen(true);
                }}
              >
                Open Panel (should auto-open Rail)
              </Button>
              <Button
                size="2"
                variant="soft"
                color="gray"
                highContrast
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
          <Box mb="5" p="4" style={{ background: 'var(--green-a3)', borderRadius: 'var(--radius-3)' }}>
            <Heading size="3" mb="3">Stress Tests</Heading>
            <Text size="2" color="gray" mb="3">
              Rapid state changes to test for race conditions and stale closures.
            </Text>
            <Flex gap="2" wrap="wrap">
              <Button
                size="2"
                variant="classic"
                color="green"
                highContrast
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
                variant="classic"
                color="green"
                highContrast
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
                highContrast
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
                highContrast
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
          <Box p="4" style={{ background: 'var(--gray-a3)', borderRadius: 'var(--radius-3)' }}>
            <Flex align="center" justify="between" mb="3">
              <Heading size="3">Event Log ({logs.length})</Heading>
              <Button size="1" variant="soft" color="gray" highContrast onClick={clearLogs}>
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
                background: 'var(--gray-1)',
                borderRadius: 'var(--radius-2)',
                padding: 'var(--space-2)',
              }}
            >
              {logs.length === 0 ? (
                <Text size="1" color="gray">No events yet. Interact with the panes to see events.</Text>
              ) : (
                logs.map((log) => (
                  <Flex key={log.id} gap="2" align="baseline">
                    <Text size="1" color="gray" style={{ fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                      {log.timestamp}
                    </Text>
                    <Badge size="1" color={
                      log.pane === 'Rail' ? 'blue' :
                      log.pane === 'Panel' ? 'violet' :
                      log.pane === 'Inspector' ? 'orange' :
                      log.pane === 'Bottom' ? 'crimson' :
                      'gray'
                    }>
                      {log.pane}
                    </Badge>
                    <Text size="1" weight="medium" style={{ fontFamily: 'inherit' }}>
                      {log.event}
                    </Text>
                    {log.detail && (
                      <Text size="1" color="gray" style={{ fontFamily: 'inherit' }}>
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
        <Flex direction="column" p="3" gap="3" height="100%">
          <Flex align="center" justify="between">
            <Heading size="3">Inspector</Heading>
            <IconButton variant="ghost" size="1" color="gray" highContrast asChild>
              <Shell.Trigger target="inspector" action="collapse">
                <HugeiconsIcon icon={SidebarRight01Icon} strokeWidth={1.75} />
              </Shell.Trigger>
            </IconButton>
          </Flex>
          <Separator size="4" />
          <Flex direction="column" gap="3">
            <Box>
              <Text size="2" weight="medium" mb="1">Properties</Text>
              <Text size="1" color="gray">Selected item properties would appear here.</Text>
            </Box>
            <Separator size="4" />
            <Box>
              <Text size="2" weight="medium" mb="1">State Debug</Text>
              <Flex direction="column" gap="1">
                <Text size="1">Rail: <Code>{String(railOpen)}</Code></Text>
                <Text size="1">Panel: <Code>{String(panelOpen)}</Code></Text>
                <Text size="1">Inspector: <Code>{String(inspectorOpen)}</Code></Text>
                <Text size="1">Bottom: <Code>{String(bottomOpen)}</Code></Text>
              </Flex>
            </Box>
          </Flex>
          <Box style={{ flex: 1 }} />
          <Text size="1" color="gray">Controlled: open={String(inspectorOpen)}</Text>
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
        <Flex direction="column" p="3" gap="2" height="100%">
          <Flex align="center" justify="between">
            <Flex align="center" gap="2">
              <Heading size="3">Terminal</Heading>
              <Badge size="1" color="green">Active</Badge>
            </Flex>
            <Flex gap="1">
              <IconButton variant="ghost" size="1" color="gray" highContrast asChild>
                <Shell.Trigger target="bottom" action="collapse">
                  <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.75} />
                </Shell.Trigger>
              </IconButton>
            </Flex>
          </Flex>
          <Box
            style={{
              flex: 1,
              fontFamily: 'var(--code-font-family)',
              fontSize: 'var(--font-size-1)',
              background: 'var(--gray-1)',
              borderRadius: 'var(--radius-2)',
              padding: 'var(--space-2)',
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
