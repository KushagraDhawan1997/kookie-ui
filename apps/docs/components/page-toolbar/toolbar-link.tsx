'use client';

import * as React from 'react';
import { ToolbarButton } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';

/**
 * An icon-only toolbar control that navigates. v2 writes `<ToolbarButton render={<a />}>`; v1
 * writes `<ToolbarButton asChild>`, which renders the link through Radix `Toolbar.Link`, so it
 * stays in the arrow-key row and gets no `type` attribute.
 */
export function ToolbarLinkButton({
  label,
  tooltip,
  icon,
  link,
}: {
  /** Accessible name. */
  label: string;
  /** Tooltip text. Defaults to the label. */
  tooltip?: React.ReactNode;
  icon: IconSvgElement;
  /** The anchor (or `next/link`) to render as, without children. */
  link: React.ReactElement<{ children?: React.ReactNode }>;
}) {
  return (
    <ToolbarButton asChild iconOnly aria-label={label} tooltip={tooltip ?? label} tooltipSide="bottom">
      {React.cloneElement(link, undefined, <HugeiconsIcon icon={icon} strokeWidth={1.75} />)}
    </ToolbarButton>
  );
}
