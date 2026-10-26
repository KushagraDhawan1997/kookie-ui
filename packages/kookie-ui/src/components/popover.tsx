import * as React from 'react';
import classNames from 'classnames';
import { Popover as PopoverPrimitive } from 'radix-ui';

import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../hooks/theme-size.js';
import { requireReactElement } from '../helpers/require-react-element.js';
import { popoverContentPropDefs } from './popover.props.js';
import { PortalTheme } from './_internal/portal-theme.js';

import type { PopoverContentOwnProps } from './popover.props.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';

// ---------------------------------------------
// Popover Content Context
// ---------------------------------------------
type PopoverContentContextValue = {
  /** Wire up aria-labelledby for toolbar title */
  setLabelId: (id: string | undefined) => void;
};

const PopoverContentContext = React.createContext<PopoverContentContextValue | null>(null);
const usePopoverContentContext = (caller: string) => {
  const ctx = React.useContext(PopoverContentContext);
  if (!ctx) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`${caller} must be used within Popover.Content`);
    }
  }
  return ctx;
};

interface PopoverRootProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {}
const PopoverRoot: React.FC<PopoverRootProps> = (props: PopoverRootProps) => (
  <PopoverPrimitive.Root {...props} />
);
PopoverRoot.displayName = 'Popover.Root';

type PopoverTriggerElement = React.ElementRef<typeof PopoverPrimitive.Trigger>;
interface PopoverTriggerProps
  extends ComponentPropsWithout<typeof PopoverPrimitive.Trigger, RemovedProps> {}
const PopoverTrigger = React.forwardRef<PopoverTriggerElement, PopoverTriggerProps>(
  ({ children, ...props }, forwardedRef) => (
    <PopoverPrimitive.Trigger {...props} ref={forwardedRef} asChild>
      {requireReactElement(children)}
    </PopoverPrimitive.Trigger>
  ),
);
PopoverTrigger.displayName = 'Popover.Trigger';

type PopoverContentElement = React.ElementRef<typeof PopoverPrimitive.Content>;
interface PopoverContentProps
  extends ComponentPropsWithout<typeof PopoverPrimitive.Content, RemovedProps>,
    PopoverContentOwnProps {
  container?: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal>['container'];
}
const PopoverContent = React.forwardRef<PopoverContentElement, PopoverContentProps>(
  (ownProps, forwardedRef) => {
    const props = useThemeSizeProps(ownProps, popoverContentPropDefs.size);
    const {
      className,
      forceMount,
      container,
      ...contentProps
    } = extractProps(props, popoverContentPropDefs);

    const [labelId, setLabelId] = React.useState<string | undefined>(undefined);
    const contextValue = React.useMemo(() => ({ setLabelId }), []);

    return (
      <PopoverPrimitive.Portal container={container} forceMount={forceMount}>
        <PortalTheme asChild>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={8}
            collisionPadding={10}
            {...contentProps}
            ref={forwardedRef}
            // A Toolbar.Title names the panel; without one, the caller's own value stands.
            aria-labelledby={labelId ?? contentProps['aria-labelledby']}
            className={classNames('kui-PopperContent', 'kui-PopoverContent', className)}
          >
            <PopoverContentContext.Provider value={contextValue}>
              {props.children}
            </PopoverContentContext.Provider>
          </PopoverPrimitive.Content>
        </PortalTheme>
      </PopoverPrimitive.Portal>
    );
  },
);
PopoverContent.displayName = 'Popover.Content';

type PopoverCloseElement = React.ElementRef<typeof PopoverPrimitive.Close>;
interface PopoverCloseProps
  extends ComponentPropsWithout<typeof PopoverPrimitive.Close, RemovedProps> {}
const PopoverClose = React.forwardRef<PopoverCloseElement, PopoverCloseProps>(
  ({ children, ...props }, forwardedRef) => (
    <PopoverPrimitive.Close {...props} ref={forwardedRef} asChild>
      {requireReactElement(children)}
    </PopoverPrimitive.Close>
  ),
);
PopoverClose.displayName = 'Popover.Close';

type PopoverAnchorElement = React.ElementRef<typeof PopoverPrimitive.Anchor>;
interface PopoverAnchorProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor> {}
const PopoverAnchor = React.forwardRef<PopoverAnchorElement, PopoverAnchorProps>(
  (props, forwardedRef) => <PopoverPrimitive.Anchor {...props} ref={forwardedRef} />,
);

PopoverAnchor.displayName = 'Popover.Anchor';

// ---------------------------------------------
// Toolbar (Popover-only)
// ---------------------------------------------

type PopoverToolbarElement = HTMLDivElement;
type PopoverToolbarProps = React.ComponentPropsWithoutRef<'div'>;

const PopoverToolbarBase = React.forwardRef<PopoverToolbarElement, PopoverToolbarProps>(
  ({ className, children, ...props }, forwardedRef) => {
    // The toolbar is sticky in the content's own CSS, so it needs no measuring; this only warns
    // when it is used outside Popover.Content.
    usePopoverContentContext('Popover.Toolbar');

    return (
      <div {...props} ref={forwardedRef} className={classNames('kui-PopoverToolbar', className)}>
        {children}
      </div>
    );
  },
);
PopoverToolbarBase.displayName = 'Popover.Toolbar';

type PopoverToolbarSectionProps = React.ComponentPropsWithoutRef<'div'>;

const PopoverToolbarLeft = React.forwardRef<HTMLDivElement, PopoverToolbarSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={classNames('kui-PopoverToolbarSection', 'kui-PopoverToolbarLeft', className)}
    />
  ),
);
PopoverToolbarLeft.displayName = 'Popover.Toolbar.Left';

const PopoverToolbarCenter = React.forwardRef<HTMLDivElement, PopoverToolbarSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={classNames('kui-PopoverToolbarSection', 'kui-PopoverToolbarCenter', className)}
    />
  ),
);
PopoverToolbarCenter.displayName = 'Popover.Toolbar.Center';

const PopoverToolbarRight = React.forwardRef<HTMLDivElement, PopoverToolbarSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={classNames('kui-PopoverToolbarSection', 'kui-PopoverToolbarRight', className)}
    />
  ),
);
PopoverToolbarRight.displayName = 'Popover.Toolbar.Right';

type PopoverToolbarTitleProps = React.ComponentPropsWithoutRef<'span'>;
const PopoverToolbarTitle = React.forwardRef<HTMLSpanElement, PopoverToolbarTitleProps>(
  ({ className, id: idProp, ...props }, ref) => {
    const ctx = usePopoverContentContext('Popover.Toolbar.Title');
    const reactId = React.useId();
    const id = idProp ?? `kui-popover-toolbar-title-${reactId}`;
    React.useEffect(() => {
      ctx?.setLabelId(id);
      return () => ctx?.setLabelId(undefined);
    }, [ctx, id]);
    return (
      <span
        {...props}
        id={id}
        ref={ref}
        className={classNames('kui-PopoverToolbarTitle', className)}
      />
    );
  },
);
PopoverToolbarTitle.displayName = 'Popover.Toolbar.Title';

type PopoverToolbarComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<PopoverToolbarProps> & React.RefAttributes<HTMLDivElement>
> & {
  Left: typeof PopoverToolbarLeft;
  Center: typeof PopoverToolbarCenter;
  Right: typeof PopoverToolbarRight;
  Title: typeof PopoverToolbarTitle;
};

const PopoverToolbar = Object.assign(PopoverToolbarBase, {
  Left: PopoverToolbarLeft,
  Center: PopoverToolbarCenter,
  Right: PopoverToolbarRight,
  Title: PopoverToolbarTitle,
}) as PopoverToolbarComponent;

export {
  PopoverRoot as Root,
  PopoverContent as Content,
  PopoverTrigger as Trigger,
  PopoverClose as Close,
  PopoverAnchor as Anchor,
  PopoverToolbar as Toolbar,
};
export type {
  PopoverRootProps as RootProps,
  PopoverContentProps as ContentProps,
  PopoverTriggerProps as TriggerProps,
  PopoverCloseProps as CloseProps,
  PopoverAnchorProps as AnchorProps,
  PopoverToolbarProps as ToolbarProps,
  PopoverToolbarSectionProps as ToolbarSectionProps,
  PopoverToolbarTitleProps as ToolbarTitleProps,
};
