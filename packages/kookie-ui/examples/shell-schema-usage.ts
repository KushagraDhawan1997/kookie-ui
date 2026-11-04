/**
 * Shell schema usage examples
 *
 * The Shell schemas describe the Shell's props for tools that read a schema:
 * prop validation in development, and JSON schema generation for editors and
 * assistants.
 */

import type { z } from 'zod';
import {
  ShellRootSchema,
  ShellSidebarSchema,
  ShellInspectorSchema,
  ShellTriggerSchema,
  parseShellRootProps,
  parseShellSidebarProps,
  parseShellInspectorProps,
  parseShellTriggerProps,
} from '../src/components/schemas/shell.schema.js';

// The props a caller writes are the schema's INPUT: a defaulted field is
// optional there. The `Shell*Props` types the schema module exports are the
// parsed OUTPUT, where every default has been filled in.
type ShellRootProps = z.input<typeof ShellRootSchema>;
type ShellSidebarProps = z.input<typeof ShellSidebarSchema>;
type ShellInspectorProps = z.input<typeof ShellInspectorSchema>;
type ShellTriggerProps = z.input<typeof ShellTriggerSchema>;

// Example 1: the Root
const rootProps: ShellRootProps = {
  height: 'full',
  className: 'my-shell',
  children: 'Shell content',
};

const validatedRootProps = parseShellRootProps(rootProps);

// Example 2: a Sidebar nobody has touched. It follows the window: open where
// it is in the frame, closed where it is an overlay.
const untouchedSidebarProps: ShellSidebarProps = {
  presentation: { initial: 'overlay', sm: 'fixed' },
  expandedSize: 288,
};

const validatedUntouchedSidebar = parseShellSidebarProps(untouchedSidebarProps);

// Example 3: a Sidebar with a responsive starting state. The object is the
// answer at each breakpoint until a user changes the state.
const responsiveSidebarProps: ShellSidebarProps = {
  defaultState: { initial: 'collapsed', lg: 'expanded' },
  presentation: { initial: 'overlay', sm: 'fixed' },
  onStateChange: (state, { reason }) => console.log('Sidebar state:', state, reason),
};

const validatedResponsiveSidebar = parseShellSidebarProps(responsiveSidebarProps);

// Example 4: a resizable Inspector whose size the app keeps. Save the size in
// your own storage from onSizeChange, and pass it back as `size`.
let inspectorWidth = 320;
const inspectorProps: ShellInspectorProps = {
  defaultOpen: { initial: false, lg: true },
  resizable: true,
  size: inspectorWidth,
  minSize: 240,
  maxSize: 480,
  onSizeChange: (size) => {
    inspectorWidth = size;
  },
  onOpenChange: (open, { reason }) => console.log('Inspector open:', open, reason),
};

const validatedInspectorProps = parseShellInspectorProps(inspectorProps);

// Example 5: a Trigger. It renders type="button", aria-controls and
// aria-expanded; onClick runs first and preventDefault() cancels it.
const triggerProps: ShellTriggerProps = {
  target: 'sidebar',
  action: 'toggle',
  'aria-label': 'Toggle navigation',
  onClick: () => console.log('Sidebar toggled'),
};

const validatedTriggerProps = parseShellTriggerProps(triggerProps);

// Example 6: validation with error handling
const result = ShellRootSchema.safeParse({ height: true });
if (!result.success) {
  console.error('Schema validation failed:', result.error.message);
}

export { validatedRootProps, validatedUntouchedSidebar, validatedResponsiveSidebar, validatedInspectorProps, validatedTriggerProps };
