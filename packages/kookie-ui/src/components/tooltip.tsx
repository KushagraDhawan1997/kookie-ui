import * as React from 'react';
import classNames from 'classnames';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { Text } from './text.js';
import { Theme } from './theme.js';
import { extractProps } from '../helpers/extract-props.js';
import { tooltipPropDefs } from './tooltip.props.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

/** The rest before a tooltip opens, in milliseconds. */
const TOOLTIP_DELAY = 200;

/** True inside a `TooltipProvider`, so a Tooltip knows it need not bring its own. */
const TooltipProviderContext = React.createContext(false);

interface TooltipProviderProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider> {}

/**
 * Groups the tooltips inside it: the first one waits `delayDuration` (200ms), and the next ones
 * open at once while the pointer moves between them. Put it once near the root of the app.
 * A Tooltip outside one still works, with the same delay, but each one waits on its own.
 */
function TooltipProvider({ delayDuration = TOOLTIP_DELAY, children, ...props }: TooltipProviderProps) {
  return (
    <TooltipProviderContext.Provider value={true}>
      <TooltipPrimitive.Provider delayDuration={delayDuration} {...props}>
        {children}
      </TooltipPrimitive.Provider>
    </TooltipProviderContext.Provider>
  );
}
TooltipProvider.displayName = 'TooltipProvider';

type TooltipElement = React.ElementRef<typeof TooltipPrimitive.Content>;
type TooltipOwnProps = GetPropDefTypes<typeof tooltipPropDefs>;
interface TooltipProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>,
    ComponentPropsWithout<typeof TooltipPrimitive.Content, RemovedProps | 'content'>,
    TooltipOwnProps {
  content: React.ReactNode;
  container?: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Portal>['container'];
}
const Tooltip = React.forwardRef<TooltipElement, TooltipProps>((props, forwardedRef) => {
  const {
    children,
    className,
    open,
    defaultOpen,
    onOpenChange,
    delayDuration,
    disableHoverableContent,
    content,
    container,
    forceMount,
    ...tooltipContentProps
  } = extractProps(props, tooltipPropDefs);
  const rootProps = { open, defaultOpen, onOpenChange, delayDuration, disableHoverableContent };
  const hasProvider = React.useContext(TooltipProviderContext);
  const tooltip = (
    <TooltipPrimitive.Root {...rootProps}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal container={container} forceMount={forceMount}>
        <Theme asChild>
          <TooltipPrimitive.Content
            sideOffset={4}
            collisionPadding={10}
            {...tooltipContentProps}
            asChild={false}
            ref={forwardedRef}
            className={classNames('kui-TooltipContent', className)}
          >
            <Text as="p" className="kui-TooltipText" size="1">
              {content}
            </Text>
            <TooltipPrimitive.Arrow className="kui-TooltipArrow" />
          </TooltipPrimitive.Content>
        </Theme>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
  // Radix needs a provider above every tooltip. Outside a TooltipProvider, bring one.
  return hasProvider ? tooltip : <TooltipPrimitive.Provider delayDuration={TOOLTIP_DELAY}>{tooltip}</TooltipPrimitive.Provider>;
});
Tooltip.displayName = 'Tooltip';

export { Tooltip, TooltipProvider };
export type { TooltipProps, TooltipProviderProps };
