import { z } from 'zod';

/**
 * Shell Zod schema - Single source of truth for Shell component props
 *
 * The Shell component is a layout engine that provides structural patterns for building
 * application interfaces. It manages layout state, composition rules, and responsive
 * behavior across seven core slots.
 *
 * Schemas are permissive about unknown keys: every slot also accepts the DOM props of the
 * element it renders (`id`, `data-*`, `aria-*`, event handlers). Only the documented props
 * are validated.
 *
 * @example
 * ```tsx
 * // Basic shell validation
 * const props = ShellRootSchema.parse({ height: 'full' });
 *
 * // Shell with a responsive sidebar
 * const sidebarProps = ShellSidebarSchema.parse({
 *   defaultState: { initial: 'collapsed', md: 'expanded' },
 *   presentation: { initial: 'overlay', lg: 'fixed' }
 * });
 * ```
 */

// Common types
const _PaneModeSchema = z.enum(['expanded', 'collapsed']).describe('Pane state mode');
const SidebarModeSchema = z.enum(['collapsed', 'thin', 'expanded']).describe('Sidebar state mode');
const PresentationValueSchema = z.enum(['fixed', 'overlay', 'stacked']).describe('Presentation mode');
const _BreakpointSchema = z.enum(['initial', 'xs', 'sm', 'md', 'lg', 'xl']).describe('Responsive breakpoint');
const PaneTargetSchema = z.enum(['left', 'rail', 'panel', 'sidebar', 'inspector', 'bottom']).describe('Pane target');
const TriggerActionSchema = z.enum(['toggle', 'expand', 'collapse']).describe('Trigger action');

/** Build the responsive-object form of a value schema. */
const responsive = <T extends z.ZodTypeAny>(value: T) =>
  z.union([
    value,
    z.object({
      initial: value.optional(),
      xs: value.optional(),
      sm: value.optional(),
      md: value.optional(),
      lg: value.optional(),
      xl: value.optional(),
    }),
  ]);

// Responsive schemas
const ResponsiveBooleanSchema = responsive(z.boolean()).describe('Boolean, or a per-breakpoint map');
const ResponsiveSidebarModeSchema = responsive(SidebarModeSchema).describe('Responsive sidebar state configuration');
const ResponsivePresentationSchema = responsive(PresentationValueSchema).describe('Responsive presentation configuration');

// Size persistence adapter
const PaneSizePersistenceSchema = z
  .object({
    load: z
      .function()
      .returns(z.union([z.number(), z.promise(z.union([z.number(), z.undefined()])), z.undefined()]))
      .optional(),
    save: z
      .function()
      .args(z.number())
      .returns(z.union([z.void(), z.promise(z.void())]))
      .optional(),
  })
  .describe('Size persistence adapter');

// Reason codes carried by callback metadata
const OpenChangeMetaSchema = z.object({ reason: z.enum(['init', 'toggle', 'responsive', 'panel', 'left']) }).describe('Why the open state changed');
const StateChangeMetaSchema = z.object({ reason: z.enum(['init', 'toggle', 'responsive']) }).describe('Why the sidebar state changed');
const SizeChangeMetaSchema = z.object({ reason: z.enum(['init', 'resize', 'controlled']) }).describe('Why the size changed');

const SizeValueSchema = z.union([z.number(), z.string()]).describe('Size in pixels, or any CSS length');

const ElementPropsSchema = z.object({
  id: z.string().optional().describe('Element id'),
  className: z.string().optional().describe('Additional CSS class name'),
  style: z
    .record(z.string(), z.union([z.string(), z.number()]))
    .optional()
    .describe('Inline styles'),
  children: z.any().optional().describe('Slot content'),
});

/** Drag-to-resize behaviour, shared by Panel, Sidebar, Inspector and Bottom. */
const ResizablePropsSchema = z.object({
  resizable: z.boolean().optional().describe('Enable drag-to-resize. Default: false'),
  collapsible: z.boolean().optional().describe('Allow collapsing. Default: true'),
  size: SizeValueSchema.optional().describe('Controlled size'),
  defaultSize: SizeValueSchema.optional().describe('Initial size when uncontrolled'),
  onSizeChange: z.function().args(z.number(), SizeChangeMetaSchema).returns(z.void()).optional().describe('Fired when the size changes'),
  sizeUpdate: z.enum(['throttle', 'debounce']).optional().describe('Rate-limit strategy for onSizeChange'),
  sizeUpdateMs: z.number().optional().describe('Milliseconds for throttle/debounce. Default: 50'),
  onResize: z.function().args(z.number()).returns(z.void()).optional().describe('Fired continuously during a resize'),
  onResizeStart: z.function().args(z.number()).returns(z.void()).optional().describe('Fired when a resize starts'),
  onResizeEnd: z.function().args(z.number()).returns(z.void()).optional().describe('Fired when a resize ends'),
  snapPoints: z.array(z.number()).optional().describe('Sizes the handle snaps to'),
  snapTolerance: z.number().optional().describe('Distance in pixels that triggers a snap. Default: 8'),
  collapseThreshold: z.number().optional().describe('Size below which the pane auto-collapses'),
  paneId: z.string().optional().describe('Unique id used for built-in size persistence'),
  persistence: PaneSizePersistenceSchema.optional().describe('Custom adapter for saving/loading size'),
  onExpand: z.function().returns(z.void()).optional().describe('Fired when the pane expands'),
  onCollapse: z.function().returns(z.void()).optional().describe('Fired when the pane collapses'),
  inset: z.boolean().optional().describe('Float the pane with a margin and a gray shell backdrop'),
});

/** `open` / `defaultOpen` / `onOpenChange`, shared by Rail, Panel, Inspector and Bottom. */
const OpenPropsSchema = z.object({
  open: ResponsiveBooleanSchema.optional().describe('Controlled open state'),
  defaultOpen: ResponsiveBooleanSchema.optional().describe('Initial open state when uncontrolled'),
  onOpenChange: z.function().args(z.boolean(), OpenChangeMetaSchema).returns(z.void()).optional().describe('Fired when the open state changes'),
});

/**
 * Shell.Root component schema
 */
export const ShellRootSchema = ElementPropsSchema.extend({
  height: z
    .union([z.literal('full'), z.literal('auto'), z.string(), z.number()])
    .default('full')
    .describe('Height of the shell container'),
});

/**
 * Shell.Header component schema
 */
export const ShellHeaderSchema = ElementPropsSchema.extend({
  height: z.number().default(64).describe('Height of the header in pixels'),
});

/**
 * Shell.Rail component schema
 */
export const ShellRailSchema = ElementPropsSchema.merge(OpenPropsSchema).extend({
  presentation: ResponsivePresentationSchema.optional().describe("How the rail interacts with layout. Default: { initial: 'fixed', sm: 'fixed' }"),
  expandedSize: z.number().default(64).describe('Width in pixels'),
  collapsible: z.boolean().optional().describe('Allow collapsing. Default: true'),
  onExpand: z.function().returns(z.void()).optional().describe('Fired when the rail expands'),
  onCollapse: z.function().returns(z.void()).optional().describe('Fired when the rail collapses'),
  inset: z.boolean().optional().describe('Float Rail+Panel with a margin and a gray shell backdrop'),
});

/**
 * Shell.Panel component schema
 */
export const ShellPanelSchema = ElementPropsSchema.merge(OpenPropsSchema)
  .merge(ResizablePropsSchema)
  .extend({
    expandedSize: z.number().default(288).describe('Width in pixels when expanded'),
    minSize: z.number().default(100).describe('Minimum width when resizing'),
    maxSize: z.number().default(800).describe('Maximum width when resizing'),
  });

/**
 * Shell.Sidebar component schema
 */
export const ShellSidebarSchema = ElementPropsSchema.merge(ResizablePropsSchema).extend({
  state: ResponsiveSidebarModeSchema.optional().describe('Controlled sidebar state'),
  defaultState: ResponsiveSidebarModeSchema.optional().describe("Initial sidebar state when uncontrolled. Default: 'expanded'"),
  onStateChange: z.function().args(SidebarModeSchema, StateChangeMetaSchema).returns(z.void()).optional().describe('Fired when the sidebar state changes'),
  presentation: ResponsivePresentationSchema.optional().describe("How the sidebar interacts with layout. Default: { initial: 'overlay', md: 'fixed' }"),
  expandedSize: z.number().default(288).describe('Width in pixels when expanded'),
  minSize: z.number().default(200).describe('Minimum width when resizing'),
  maxSize: z.number().default(400).describe('Maximum width when resizing'),
  thinSize: z.number().default(64).describe('Width in thin state'),
  toggleModes: z.enum(['both', 'single']).optional().describe('States included in the toggle sequence'),
});

/**
 * Shell.Content component schema
 */
export const ShellContentSchema = ElementPropsSchema.extend({
  inset: z.boolean().optional().describe('Float the content with a margin and a gray shell backdrop'),
});

/**
 * Shell.Inspector component schema
 */
export const ShellInspectorSchema = ElementPropsSchema.merge(OpenPropsSchema)
  .merge(ResizablePropsSchema)
  .extend({
    presentation: ResponsivePresentationSchema.optional().describe("How the inspector interacts with layout. Default: { initial: 'overlay', lg: 'fixed' }"),
    expandedSize: z.number().default(320).describe('Width in pixels when expanded'),
    minSize: z.number().default(200).describe('Minimum width when resizing'),
    maxSize: z.number().default(500).describe('Maximum width when resizing'),
  });

/**
 * Shell.Bottom component schema
 */
export const ShellBottomSchema = ElementPropsSchema.merge(OpenPropsSchema)
  .merge(ResizablePropsSchema)
  .extend({
    presentation: ResponsivePresentationSchema.optional().describe("How the bottom panel interacts with layout. Default: 'fixed'"),
    expandedSize: z.number().default(200).describe('Height in pixels when expanded'),
    minSize: z.number().default(100).describe('Minimum height when resizing'),
    maxSize: z.number().default(400).describe('Maximum height when resizing'),
  });

/**
 * Shell.Trigger component schema
 */
export const ShellTriggerSchema = ElementPropsSchema.extend({
  target: PaneTargetSchema.describe('Which pane to control'),
  action: TriggerActionSchema.default('toggle').describe('Action to perform'),
  peekOnHover: z.boolean().default(false).describe('Show a peek preview on hover while the target is collapsed'),
  onClick: z.function().optional().describe('Click handler'),
  onMouseEnter: z.function().optional().describe('Mouse enter handler'),
  onMouseLeave: z.function().optional().describe('Mouse leave handler'),
  'aria-label': z.string().optional().describe('ARIA label for accessibility'),
  'aria-labelledby': z.string().optional().describe('ARIA labelled by reference'),
  'aria-describedby': z.string().optional().describe('ARIA described by reference'),
});

/**
 * Shell.Handle component schema (for resize handles)
 */
export const ShellHandleSchema = ElementPropsSchema;

// Type exports
export type ShellRootProps = z.infer<typeof ShellRootSchema>;
export type ShellHeaderProps = z.infer<typeof ShellHeaderSchema>;
export type ShellRailProps = z.infer<typeof ShellRailSchema>;
export type ShellPanelProps = z.infer<typeof ShellPanelSchema>;
export type ShellSidebarProps = z.infer<typeof ShellSidebarSchema>;
export type ShellContentProps = z.infer<typeof ShellContentSchema>;
export type ShellInspectorProps = z.infer<typeof ShellInspectorSchema>;
export type ShellBottomProps = z.infer<typeof ShellBottomSchema>;
export type ShellTriggerProps = z.infer<typeof ShellTriggerSchema>;
export type ShellHandleProps = z.infer<typeof ShellHandleSchema>;

// Common type exports
export type PaneMode = z.infer<typeof _PaneModeSchema>;
export type SidebarMode = z.infer<typeof SidebarModeSchema>;
export type PresentationValue = z.infer<typeof PresentationValueSchema>;
export type Breakpoint = z.infer<typeof _BreakpointSchema>;
export type PaneTarget = z.infer<typeof PaneTargetSchema>;
export type TriggerAction = z.infer<typeof TriggerActionSchema>;
export type ResponsiveBoolean = z.infer<typeof ResponsiveBooleanSchema>;
export type ResponsiveSidebarMode = z.infer<typeof ResponsiveSidebarModeSchema>;
export type ResponsivePresentation = z.infer<typeof ResponsivePresentationSchema>;
export type PaneSizePersistence = z.infer<typeof PaneSizePersistenceSchema>;

/**
 * Development-only helper to validate and normalize Shell props
 * This function should only be used in development mode
 *
 * @param props - Props to validate and normalize
 * @returns Validated and normalized props
 *
 * @example
 * ```tsx
 * // In development, this will validate props and show helpful errors
 * const validatedProps = parseShellRootProps({ height: 'invalid' });
 * // Throws validation errors for invalid values
 * ```
 */
export function parseShellRootProps(props: unknown): ShellRootProps {
  if (process.env.NODE_ENV === 'development') {
    return ShellRootSchema.parse(props);
  }
  return props as ShellRootProps;
}

export function parseShellHeaderProps(props: unknown): ShellHeaderProps {
  if (process.env.NODE_ENV === 'development') {
    return ShellHeaderSchema.parse(props);
  }
  return props as ShellHeaderProps;
}

export function parseShellRailProps(props: unknown): ShellRailProps {
  if (process.env.NODE_ENV === 'development') {
    return ShellRailSchema.parse(props);
  }
  return props as ShellRailProps;
}

export function parseShellPanelProps(props: unknown): ShellPanelProps {
  if (process.env.NODE_ENV === 'development') {
    return ShellPanelSchema.parse(props);
  }
  return props as ShellPanelProps;
}

export function parseShellSidebarProps(props: unknown): ShellSidebarProps {
  if (process.env.NODE_ENV === 'development') {
    return ShellSidebarSchema.parse(props);
  }
  return props as ShellSidebarProps;
}

export function parseShellContentProps(props: unknown): ShellContentProps {
  if (process.env.NODE_ENV === 'development') {
    return ShellContentSchema.parse(props);
  }
  return props as ShellContentProps;
}

export function parseShellInspectorProps(props: unknown): ShellInspectorProps {
  if (process.env.NODE_ENV === 'development') {
    return ShellInspectorSchema.parse(props);
  }
  return props as ShellInspectorProps;
}

export function parseShellBottomProps(props: unknown): ShellBottomProps {
  if (process.env.NODE_ENV === 'development') {
    return ShellBottomSchema.parse(props);
  }
  return props as ShellBottomProps;
}

export function parseShellTriggerProps(props: unknown): ShellTriggerProps {
  if (process.env.NODE_ENV === 'development') {
    return ShellTriggerSchema.parse(props);
  }
  return props as ShellTriggerProps;
}

export function parseShellHandleProps(props: unknown): ShellHandleProps {
  if (process.env.NODE_ENV === 'development') {
    return ShellHandleSchema.parse(props);
  }
  return props as ShellHandleProps;
}
