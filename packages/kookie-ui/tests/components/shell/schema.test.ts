import { describe, expect, it } from 'vitest';
import { ShellInspectorSchema, ShellPanelSchema, ShellRailSchema, ShellSidebarSchema, ShellTriggerSchema } from '../../../src/components/schemas/shell.schema';

/**
 * The schema is read by tools rather than by the Shell, so nothing fails when
 * it drifts: before 0.8.0 it described `mode`/`defaultMode`/`onModeChange`,
 * an API no release had. These cases hold it to the props the panes take.
 */
describe('Shell schema', () => {
  it('describes the open-state props each pane takes', () => {
    expect(ShellPanelSchema.safeParse({ defaultOpen: { initial: false, md: true }, onOpenChange: () => {} }).success).toBe(true);
    expect(ShellRailSchema.safeParse({ open: true }).success).toBe(true);
    expect(ShellSidebarSchema.safeParse({ defaultState: { initial: 'collapsed', md: 'expanded' }, onStateChange: () => {} }).success).toBe(true);
  });

  it('refuses props no pane takes', () => {
    for (const prop of ['mode', 'defaultMode', 'onModeChange', 'resizer', 'height']) {
      expect(ShellPanelSchema.safeParse({ [prop]: 'expanded' }).success, prop).toBe(false);
    }
  });

  it('states the 0.8.0 defaults', () => {
    expect(ShellSidebarSchema.parse({}).presentation).toEqual({ initial: 'overlay', sm: 'fixed' });
    expect(ShellInspectorSchema.parse({}).presentation).toEqual({ initial: 'overlay', sm: 'fixed' });
    expect(ShellSidebarSchema.parse({}).defaultState).toBeUndefined();
    expect(ShellPanelSchema.parse({}).minSize).toBe(100);
    expect(ShellTriggerSchema.parse({ target: 'inspector' }).type).toBe('button');
  });
});
