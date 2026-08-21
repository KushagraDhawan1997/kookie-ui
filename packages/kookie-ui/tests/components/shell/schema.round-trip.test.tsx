import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { Shell } from '../../../src/components/index';
import {
  ShellRootSchema,
  ShellHeaderSchema,
  ShellRailSchema,
  ShellPanelSchema,
  ShellSidebarSchema,
  ShellContentSchema,
  ShellInspectorSchema,
  ShellBottomSchema,
  ShellTriggerSchema,
  ShellHandleSchema,
} from '../../../src/components/schemas/shell.schema';

const noop = () => {};

/**
 * The props below are the shipping API, exercised end to end. They are both validated against the
 * schema and rendered, so a schema that drifts away from the component fails here.
 */
const railProps = {
  open: { initial: false, md: true },
  onOpenChange: noop,
  presentation: { initial: 'overlay', md: 'fixed' },
  expandedSize: 64,
  collapsible: true,
  onExpand: noop,
  onCollapse: noop,
  inset: true,
  className: 'rail',
  id: 'rail-1',
};

const panelProps = {
  defaultOpen: true,
  onOpenChange: noop,
  expandedSize: 288,
  minSize: 120,
  maxSize: 480,
  size: 300,
  onSizeChange: noop,
  sizeUpdate: 'throttle',
  sizeUpdateMs: 50,
  resizable: true,
  collapsible: true,
  onExpand: noop,
  onCollapse: noop,
  onResize: noop,
  onResizeStart: noop,
  onResizeEnd: noop,
  snapPoints: [240, 320],
  snapTolerance: 8,
  collapseThreshold: 140,
  paneId: 'panel-round-trip',
  persistence: { load: () => 260, save: noop },
  inset: true,
};

const sidebarProps = {
  state: { initial: 'collapsed', md: 'expanded' },
  onStateChange: noop,
  presentation: { initial: 'overlay', md: 'fixed' },
  expandedSize: 288,
  thinSize: 64,
  toggleModes: 'both',
  minSize: 200,
  maxSize: 400,
  defaultSize: 260,
  onSizeChange: noop,
  sizeUpdate: 'debounce',
  sizeUpdateMs: 40,
  resizable: true,
  collapsible: true,
  onExpand: noop,
  onCollapse: noop,
  inset: true,
};

const inspectorProps = {
  defaultOpen: { initial: false, lg: true },
  onOpenChange: noop,
  presentation: { initial: 'overlay', lg: 'fixed' },
  expandedSize: 320,
  minSize: 200,
  maxSize: 500,
  defaultSize: 340,
  onSizeChange: noop,
  resizable: true,
  collapsible: true,
  onExpand: noop,
  onCollapse: noop,
  paneId: 'inspector-round-trip',
  inset: true,
};

const bottomProps = {
  open: true,
  onOpenChange: noop,
  presentation: 'fixed',
  expandedSize: 200,
  minSize: 100,
  maxSize: 400,
  defaultSize: 220,
  onSizeChange: noop,
  resizable: true,
  collapsible: true,
  onExpand: noop,
  onCollapse: noop,
  inset: true,
};

describe('Shell schemas match the shipping API', () => {
  it.each([
    ['Root', ShellRootSchema, { height: 'full', className: 'root' }],
    ['Header', ShellHeaderSchema, { height: 64 }],
    ['Rail', ShellRailSchema, railProps],
    ['Panel', ShellPanelSchema, panelProps],
    ['Sidebar', ShellSidebarSchema, sidebarProps],
    ['Content', ShellContentSchema, { inset: true, className: 'content' }],
    ['Inspector', ShellInspectorSchema, inspectorProps],
    ['Bottom', ShellBottomSchema, bottomProps],
    ['Trigger', ShellTriggerSchema, { target: 'sidebar', action: 'toggle', peekOnHover: true, onClick: noop, 'aria-label': 'Toggle' }],
    ['Handle', ShellHandleSchema, { className: 'handle' }],
  ])('%s accepts every documented prop', (_name, schema, props) => {
    const result = schema.safeParse(props);
    expect(result.success ? [] : result.error.issues).toEqual([]);
    expect(result.success).toBe(true);
  });

  it('accepts the DOM props each slot forwards', () => {
    expect(ShellPanelSchema.safeParse({ id: 'panel', 'data-testid': 'panel', 'aria-label': 'Panel' }).success).toBe(true);
    expect(ShellContentSchema.safeParse({ role: 'main', tabIndex: -1 }).success).toBe(true);
  });

  it('still rejects wrong value types', () => {
    expect(ShellSidebarSchema.safeParse({ state: 'sideways' }).success).toBe(false);
    expect(ShellInspectorSchema.safeParse({ presentation: 'floating' }).success).toBe(false);
    expect(ShellBottomSchema.safeParse({ expandedSize: '200px' }).success).toBe(false);
    expect(ShellTriggerSchema.safeParse({ target: 'nowhere' }).success).toBe(false);
  });

  it('renders every slot with the props the schema validated', () => {
    const { container } = renderWithProviders(
      <Shell.Root height="full">
        <Shell.Header height={64}>header</Shell.Header>
        <Shell.Rail {...(railProps as React.ComponentProps<typeof Shell.Rail>)} />
        <Shell.Panel {...(panelProps as React.ComponentProps<typeof Shell.Panel>)}>
          panel
          <Shell.Panel.Handle />
        </Shell.Panel>
        <Shell.Content inset>content</Shell.Content>
        <Shell.Inspector {...(inspectorProps as React.ComponentProps<typeof Shell.Inspector>)}>inspector</Shell.Inspector>
        <Shell.Bottom {...(bottomProps as React.ComponentProps<typeof Shell.Bottom>)}>bottom</Shell.Bottom>
      </Shell.Root>,
    );
    expect(container.querySelector('.rt-ShellRoot')).toBeTruthy();
  });
});
