'use client';

import { ToolbarButton, useAppearance } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';

/**
 * Switches the site between light and dark. A toolbar button: it lives in the sidebar's footer row. The mode lives on `<html>`, written before the
 * first paint by `appearanceScript` in the layout, so menus, sheets and nested themes follow it
 * without being patched here.
 */
export function DarkModeToggle() {
  const { appearance, setAppearance } = useAppearance();
  const isDark = appearance === 'dark';

  return (
    <ToolbarButton
      iconOnly
      onClick={() => setAppearance(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} strokeWidth={1.75} />
    </ToolbarButton>
  );
}
