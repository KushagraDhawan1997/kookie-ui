'use client';

import { IconButton, useAppearance } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';

/**
 * Switches the site between light and dark. The mode lives on `<html>`, written before the
 * first paint by `appearanceScript` in the layout, so menus, sheets and nested themes follow it
 * without being patched here.
 */
export function DarkModeToggle() {
  const { appearance, setAppearance } = useAppearance();
  const isDark = appearance === 'dark';

  return (
    <IconButton
      variant="ghost"
      size="2"
      color="gray"
      onClick={() => setAppearance(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} strokeWidth={1.75} />
    </IconButton>
  );
}
