import { expectAssignable, expectNotAssignable } from 'tsd';
import type { ComponentProps } from 'react';
import { Shell } from '../../dist/esm/components/index.js';

type PanelProps = ComponentProps<typeof Shell.Panel>;
type RailProps = ComponentProps<typeof Shell.Rail>;
type SidebarProps = ComponentProps<typeof Shell.Sidebar>;
type InspectorProps = ComponentProps<typeof Shell.Inspector>;

// Valid uncontrolled
expectAssignable<PanelProps>({ defaultOpen: true });
expectAssignable<PanelProps>({ defaultOpen: false, onOpenChange: () => {} });

// Valid controlled
expectAssignable<PanelProps>({ open: true });
expectAssignable<PanelProps>({ open: false, onOpenChange: () => {} });

// Invalid: both provided
// @ts-expect-error
const invalidPanelBoth: PanelProps = { open: true, defaultOpen: true };

// Rail XOR
expectAssignable<RailProps>({ defaultOpen: true });
expectAssignable<RailProps>({ open: true });
// @ts-expect-error
const invalidRailBoth: RailProps = { open: true, defaultOpen: true };

// Sidebar XOR
expectAssignable<SidebarProps>({ defaultState: 'expanded' });
expectAssignable<SidebarProps>({ state: 'collapsed' });
// @ts-expect-error
const invalidSidebarBoth: SidebarProps = { state: 'collapsed', defaultState: 'expanded' };

// Inspector XOR
expectAssignable<InspectorProps>({ defaultOpen: true });
expectAssignable<InspectorProps>({ open: true });
// @ts-expect-error
const invalidInspectorBoth: InspectorProps = { open: true, defaultOpen: true };

// Root was cast to the Panel's component type, so TypeScript offered Panel's
// props on Root and refused Root's own height values.
type RootProps = ComponentProps<typeof Shell.Root>;
expectAssignable<RootProps>({ children: null, height: 'full' });
expectAssignable<RootProps>({ children: null, height: 480 });
expectNotAssignable<RootProps>({ children: null, defaultOpen: true });
expectNotAssignable<RootProps>({ children: null, onSizeChange: () => {} });
