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

// Every part's props are exported under a stable name, matching what the part takes.
expectAssignable<Shell.RailProps>({ defaultOpen: true });
expectAssignable<Shell.PanelProps>({ open: true });
expectAssignable<Shell.SidebarProps>({ defaultState: 'expanded' });
expectAssignable<Shell.InspectorProps>({ defaultOpen: true });
expectAssignable<Shell.BottomProps>({ defaultOpen: true });
expectAssignable<Shell.TriggerProps>({ target: 'sidebar' });
expectAssignable<Shell.RootProps>({ children: null, height: 'full' });
expectAssignable<Shell.HeaderProps>({});
expectAssignable<Shell.ContentProps>({ flush: false });
expectAssignable<Shell.HeaderProps>({ flush: false });
expectNotAssignable<Shell.ContentProps>({ inset: true });
expectAssignable<Shell.PaneHeaderProps>({ float: true });
expectAssignable<Shell.PaneFooterProps>({ float: true });
expectAssignable<Shell.ScrollProps>({ fade: true });
expectAssignable<RailProps>({} as Shell.RailProps);
expectAssignable<PanelProps>({} as Shell.PanelProps);
expectAssignable<SidebarProps>({} as Shell.SidebarProps);
expectAssignable<InspectorProps>({} as Shell.InspectorProps);

// 0.37.0 removed the options kept from 0.7: a pane takes none of them.
expectNotAssignable<Shell.PanelProps>({ snapPoints: [200] });
expectNotAssignable<Shell.PanelProps>({ collapseThreshold: 80 });
expectNotAssignable<Shell.PanelProps>({ paneId: 'panel' });
expectNotAssignable<Shell.InspectorProps>({ onExpand: () => {} });
expectNotAssignable<Shell.SidebarProps>({ onCollapse: () => {} });
expectNotAssignable<Shell.TriggerProps>({ target: 'left' });
expectNotAssignable<Shell.TriggerProps>({ target: 'rail', peekOnHover: true });
// A controlled value is one value; only the default takes a responsive object.
expectNotAssignable<Shell.InspectorProps>({ open: { initial: false, lg: true } });
expectAssignable<Shell.InspectorProps>({ defaultOpen: { initial: false, lg: true } });
