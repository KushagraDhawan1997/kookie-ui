import { z } from 'zod';

/**
 * Shell Zod schema: the Shell's props, for tools that read a schema
 * (editors, assistants, documentation).
 *
 * Shell is the frame of an application. Each pane holds its own open state;
 * a pane nobody has touched follows the window, and the stylesheet resolves
 * it at each breakpoint. Callbacks report user actions only.
 *
 * @example
 * ```tsx
 * const props = ShellRootSchema.parse({ height: 'full' });
 *
 * const sidebarProps = ShellSidebarSchema.parse({
 *   defaultState: { initial: 'collapsed', md: 'expanded' },
 *   presentation: { initial: 'overlay', sm: 'fixed' },
 * });
 * ```
 */

// Common types
const PaneModeSchema = z.enum(['expanded', 'collapsed']).describe('Pane state mode');
const SidebarModeSchema = z.enum(['collapsed', 'expanded']).describe('Sidebar state');
const PresentationValueSchema = z.enum(['fixed', 'overlay', 'stacked']).describe('Presentation mode');
const _BreakpointSchema = z.enum(['initial', 'xs', 'sm', 'md', 'lg', 'xl']).describe('Responsive breakpoint');
const PaneTargetSchema = z.enum(['left', 'rail', 'panel', 'sidebar', 'inspector', 'bottom']).describe('Pane target. `left` is deprecated: use `rail`.');
const TriggerActionSchema = z.enum(['toggle', 'expand', 'collapse']).describe('Trigger action');
const OpenChangeReasonSchema = z.enum(['toggle', 'dismiss']).describe('Why the state changed: `toggle` for a trigger or the resize handle, `dismiss` for Escape or the scrim');
const SizeChangeReasonSchema = z.enum(['init', 'resize', 'controlled']).describe('Why the size changed');

function responsive<T extends z.ZodTypeAny>(value: T) {
  return z.union([
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
}

// Responsive schemas
const _ResponsiveModeSchema = responsive(PaneModeSchema).describe('Responsive pane mode configuration');
const ResponsiveSidebarModeSchema = responsive(SidebarModeSchema).describe('Responsive sidebar state');
const ResponsivePresentationSchema = responsive(PresentationValueSchema).describe('Responsive presentation configuration');
const ResponsiveOpenSchema = responsive(z.boolean()).describe('Responsive open state');

// Size persistence adapter (deprecated)
const PaneSizePersistenceSchema = z
  .object({
    load: z.function({ output: z.union([z.number(), z.promise(z.number()), z.undefined()]) }).optional(),
    save: z.function({ input: [z.number()], output: z.union([z.void(), z.promise(z.void())]) }).optional(),
  })
  .describe('Deprecated, removed in 1.0. Keep the size in your own state with `size`/`onSizeChange`.');

const StyleSchema = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .optional()
  .describe('Inline styles');

const OpenPropsSchema = {
  open: z.union([z.boolean(), ResponsiveOpenSchema]).optional().describe('The open state, when controlled. A responsive object is deprecated.'),
  defaultOpen: z
    .union([z.boolean(), ResponsiveOpenSchema])
    .optional()
    .describe('The starting state. A responsive object leaves the pane untouched, with that object as the answer at each breakpoint.'),
  onOpenChange: z
    .function({ input: [z.boolean(), z.object({ reason: OpenChangeReasonSchema })], output: z.void() })
    .optional()
    .describe('Called when a user opens or closes the pane. Never called on mount or on a resize.'),
};

// Props shared by every pane
const PaneBaseShape = {
  id: z.string().optional().describe('The pane id. A Trigger points `aria-controls` at it.'),
  presentation: ResponsivePresentationSchema.optional(),
  expandedSize: z.number().optional(),
  inset: z.boolean().optional().describe('Lifts the pane off the frame and paints the backdrop behind it'),
  onExpand: z.function({ output: z.void() }).optional().describe('Deprecated: use `onOpenChange`'),
  onCollapse: z.function({ output: z.void() }).optional().describe('Deprecated: use `onOpenChange`'),
  className: z.string().optional().describe('Additional CSS class name'),
  style: StyleSchema,
  children: z.any().optional(),
};

// Props of a pane that resizes
const ResizeShape = {
  minSize: z.number().optional(),
  maxSize: z.number().optional().describe('The largest size. A drag also stops before the handle leaves the frame.'),
  resizable: z.boolean().optional(),
  collapsible: z.boolean().optional().describe('A double-click on the handle closes the pane'),
  size: z.union([z.number(), z.string()]).optional().describe('The size, when controlled'),
  defaultSize: z.union([z.number(), z.string()]).optional().describe('The starting size'),
  onSizeChange: z.function({ input: [z.number(), z.object({ reason: SizeChangeReasonSchema })], output: z.void() }).optional(),
  sizeUpdate: z
    .enum(['throttle', 'debounce'])
    .optional()
    .describe('Rate-limits onSizeChange across repeated resize ends, such as key presses on the handle. A drag calls it once, when the drag ends; use onResize for live sizes.'),
  sizeUpdateMs: z.number().optional(),
  onResize: z
    .function({ input: [z.number()], output: z.void() })
    .optional()
    .describe('Called during a drag, at most once per animation frame'),
  onResizeStart: z.function({ input: [z.number()], output: z.void() }).optional(),
  onResizeEnd: z.function({ input: [z.number()], output: z.void() }).optional(),
  snapPoints: z.array(z.number()).optional().describe('Deprecated, removed in 1.0'),
  snapTolerance: z.number().optional().describe('Deprecated, removed in 1.0'),
  collapseThreshold: z.number().optional().describe('Deprecated, removed in 1.0'),
  paneId: z.string().optional().describe('Deprecated, removed in 1.0'),
  persistence: PaneSizePersistenceSchema.optional(),
};

/**
 * Shell.Root component schema
 */
export const ShellRootSchema = z
  .object({
    height: z
      .union([z.literal('full'), z.literal('auto'), z.string(), z.number()])
      .default('full')
      .describe(
        'Height of the frame. `full` is the window: 100dvh, with 100vh where dvh is not supported, and on a narrow touch screen the page scrolls. Any value other than `full` or `auto` makes the Shell contained.',
      ),
    contained: z.boolean().default(false).describe('Fills the parent instead of the window and always scrolls inside itself. An explicit `height` implies it.'),
    size: z.enum(['1', '2', '3']).default('2').describe('Index of the pane chrome and the Sidebar rows in it'),
    className: z.string().optional().describe('Additional CSS class name'),
    style: StyleSchema,
    children: z.any().optional().describe('The Shell parts, and anything else, rendered in order'),
  })
  .strict();

/**
 * Shell.Header component schema
 */
export const ShellHeaderSchema = z
  .object({
    height: z.number().default(64).describe('Height of the header, in pixels'),
    className: z.string().optional().describe('Additional CSS class name'),
    style: StyleSchema,
    children: z.any().optional().describe('Header content'),
  })
  .strict();

/**
 * Shell.Rail component schema
 */
export const ShellRailSchema = z
  .object({
    ...PaneBaseShape,
    ...OpenPropsSchema,
    presentation: ResponsivePresentationSchema.default('fixed').describe('Presentation mode'),
    expandedSize: z.number().default(64).describe('Width in pixels'),
    collapsible: z.boolean().optional(),
  })
  .strict();

/**
 * Shell.Panel component schema
 */
export const ShellPanelSchema = z
  .object({
    ...PaneBaseShape,
    ...OpenPropsSchema,
    ...ResizeShape,
    presentation: ResponsivePresentationSchema.optional().describe("Presentation mode. With no value the panel follows the Rail's."),
    expandedSize: z.number().default(288).describe('Open width in pixels'),
    minSize: z.number().default(100).describe('Minimum width when resizing'),
    maxSize: z.number().default(800).describe('Maximum width when resizing'),
    resizable: z.boolean().default(false).describe('Whether the panel can be resized'),
    collapsible: z.boolean().default(true).describe('Whether a double-click on the handle closes the panel'),
  })
  .strict();

/**
 * Shell.Sidebar component schema
 */
export const ShellSidebarSchema = z
  .object({
    ...PaneBaseShape,
    ...ResizeShape,
    state: z.union([SidebarModeSchema, ResponsiveSidebarModeSchema]).optional().describe('The state, when controlled. A responsive object is deprecated.'),
    defaultState: ResponsiveSidebarModeSchema.optional().describe('The starting state. With no value the sidebar is open where it is in the frame and closed where it is an overlay.'),
    onStateChange: z
      .function({ input: [SidebarModeSchema, z.object({ reason: OpenChangeReasonSchema })], output: z.void() })
      .optional()
      .describe('Called when a user changes the state. Never called on mount or on a resize.'),
    presentation: ResponsivePresentationSchema.default({ initial: 'overlay', sm: 'fixed' }).describe('Presentation mode'),
    expandedSize: z.number().default(288).describe('Open width in pixels'),
    minSize: z.number().default(200).describe('Minimum width when resizing'),
    maxSize: z.number().default(400).describe('Maximum width when resizing'),
    resizable: z.boolean().default(false).describe('Whether the sidebar can be resized'),
    collapsible: z.boolean().default(true).describe('Whether a double-click on the handle closes the sidebar'),
  })
  .strict();

/**
 * Shell.Content component schema
 */
export const ShellContentSchema = z
  .object({
    inset: z.boolean().optional().describe('Lifts the pane off the frame and paints the backdrop behind it'),
    className: z.string().optional().describe('Additional CSS class name'),
    style: StyleSchema,
    children: z.any().optional().describe('Main content'),
  })
  .strict();

/**
 * Shell.Inspector component schema
 */
export const ShellInspectorSchema = z
  .object({
    ...PaneBaseShape,
    ...OpenPropsSchema,
    ...ResizeShape,
    presentation: ResponsivePresentationSchema.default({ initial: 'overlay', sm: 'fixed' }).describe('Presentation mode'),
    expandedSize: z.number().default(320).describe('Open width in pixels'),
    minSize: z.number().default(200).describe('Minimum width when resizing'),
    maxSize: z.number().default(500).describe('Maximum width when resizing'),
    resizable: z.boolean().default(false).describe('Whether the inspector can be resized'),
    collapsible: z.boolean().default(true).describe('Whether a double-click on the handle closes the inspector'),
  })
  .strict();

/**
 * Shell.Bottom component schema
 */
export const ShellBottomSchema = z
  .object({
    ...PaneBaseShape,
    ...OpenPropsSchema,
    ...ResizeShape,
    presentation: ResponsivePresentationSchema.default('fixed').describe('Presentation mode'),
    expandedSize: z.number().default(200).describe('Open height in pixels'),
    minSize: z.number().default(100).describe('Minimum height when resizing'),
    maxSize: z.number().default(400).describe('Maximum height when resizing'),
    resizable: z.boolean().default(false).describe('Whether the bottom panel can be resized'),
    collapsible: z.boolean().default(true).describe('Whether a double-click on the handle closes the panel'),
  })
  .strict();

/**
 * Shell.Trigger component schema
 */
export const ShellTriggerSchema = z
  .object({
    target: PaneTargetSchema.describe('Which pane to drive'),
    action: TriggerActionSchema.default('toggle').describe('Action to perform'),
    peekOnHover: z.boolean().default(false).describe('Deprecated, removed in 1.0. Shows a preview of a closed pane on hover.'),
    type: z.enum(['button', 'submit', 'reset']).default('button').describe('The button type'),
    className: z.string().optional().describe('Additional CSS class name'),
    style: StyleSchema,
    children: z.any().optional().describe('Trigger content'),
    onClick: z.function().optional().describe('Runs before the trigger acts. Call `event.preventDefault()` to cancel it.'),
    onMouseEnter: z.function().optional().describe('Mouse enter handler'),
    onMouseLeave: z.function().optional().describe('Mouse leave handler'),
    'aria-label': z.string().optional().describe('ARIA label for accessibility'),
    'aria-labelledby': z.string().optional().describe('ARIA labelled by reference'),
    'aria-describedby': z.string().optional().describe('ARIA described by reference'),
  })
  .strict();

/**
 * Shell.Handle component schema (for resize handles)
 */
export const ShellHandleSchema = z
  .object({
    className: z.string().optional().describe('Additional CSS class name'),
    style: StyleSchema,
    children: z.any().optional().describe('Handle content'),
  })
  .strict();

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
export type PaneMode = z.infer<typeof PaneModeSchema>;
export type SidebarMode = z.infer<typeof SidebarModeSchema>;
export type PresentationValue = z.infer<typeof PresentationValueSchema>;
export type Breakpoint = z.infer<typeof _BreakpointSchema>;
export type PaneTarget = z.infer<typeof PaneTargetSchema>;
export type TriggerAction = z.infer<typeof TriggerActionSchema>;
export type ResponsiveMode = z.infer<typeof _ResponsiveModeSchema>;
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
