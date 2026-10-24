import * as React from 'react';
import classNames from 'classnames';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { alertDialogContentPropDefs } from './alert-dialog.props.js';
import { Heading } from './heading.js';
import { Text } from './text.js';
import { Theme } from './theme.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';
import { requireReactElement } from '../helpers/require-react-element.js';

import type { AlertDialogContentOwnProps } from './alert-dialog.props.js';
import type { ComponentPropsWithout, RemovedProps, ComponentPropsAs } from '../helpers/component-props.js';

interface AlertDialogRootProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root> {}
const AlertDialogRoot: React.FC<AlertDialogRootProps> = (props) => <AlertDialogPrimitive.Root {...props} />;
AlertDialogRoot.displayName = 'AlertDialog.Root';

type AlertDialogTriggerElement = React.ElementRef<typeof AlertDialogPrimitive.Trigger>;
interface AlertDialogTriggerProps extends ComponentPropsWithout<typeof AlertDialogPrimitive.Trigger, RemovedProps> {}
const AlertDialogTrigger = React.forwardRef<AlertDialogTriggerElement, AlertDialogTriggerProps>(({ children, ...props }, forwardedRef) => (
  <AlertDialogPrimitive.Trigger {...props} ref={forwardedRef} asChild>
    {requireReactElement(children)}
  </AlertDialogPrimitive.Trigger>
));
AlertDialogTrigger.displayName = 'AlertDialog.Trigger';

// Split once at module scope. `extractProps` memoises on the identity of the
// prop def objects it is handed, so rebuilding these per render would recompile
// them on every render.
const { align: alignPropDef, ...contentPropDefs } = alertDialogContentPropDefs;
const alignPropDefs = { align: alignPropDef };

type AlertDialogContentElement = React.ElementRef<typeof AlertDialogPrimitive.Content>;
interface AlertDialogContentProps extends ComponentPropsWithout<typeof AlertDialogPrimitive.Content, RemovedProps>, AlertDialogContentOwnProps {
  container?: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Portal>['container'];
}
const AlertDialogContent = React.forwardRef<AlertDialogContentElement, AlertDialogContentProps>(({ align, ...ownProps }, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, contentPropDefs.size);
  const { className: alignClassName } = extractProps({ align }, alignPropDefs);

  const { className, forceMount, container, onCloseAutoFocus, ...contentProps } = extractProps(props, contentPropDefs);

  return (
    <AlertDialogPrimitive.Portal container={container} forceMount={forceMount}>
      <Theme asChild>
        <AlertDialogPrimitive.Overlay className="kui-BaseDialogOverlay kui-AlertDialogOverlay">
          <div className="kui-BaseDialogScroll kui-AlertDialogScroll">
            <div className={`kui-BaseDialogScrollPadding kui-AlertDialogScrollPadding ${alignClassName}`}>
              <AlertDialogPrimitive.Content
                {...contentProps}
                ref={forwardedRef}
                className={classNames('kui-BaseDialogContent', 'kui-AlertDialogContent', className)}
                aria-modal="true"
                onCloseAutoFocus={(event) => {
                  // Radix returns focus to the trigger unless the caller prevents it.
                  onCloseAutoFocus?.(event);
                  // Restore pointer-events to body (Radix UI fix for issue #1241)
                  document.body.style.pointerEvents = '';
                }}
              />
            </div>
          </div>
        </AlertDialogPrimitive.Overlay>
      </Theme>
    </AlertDialogPrimitive.Portal>
  );
});
AlertDialogContent.displayName = 'AlertDialog.Content';

type AlertDialogTitleElement = React.ElementRef<typeof Heading>;
type AlertDialogTitleProps = ComponentPropsWithout<typeof Heading, 'asChild'>;
const AlertDialogTitle = React.forwardRef<AlertDialogTitleElement, AlertDialogTitleProps>((props, forwardedRef) => (
  <AlertDialogPrimitive.Title asChild>
    <Heading size="5" trim="start" {...props} asChild={false} ref={forwardedRef} />
  </AlertDialogPrimitive.Title>
));
AlertDialogTitle.displayName = 'AlertDialog.Title';

type AlertDialogDescriptionElement = HTMLParagraphElement;
type AlertDialogDescriptionProps = ComponentPropsAs<typeof Text, 'p'>;
const AlertDialogDescription = React.forwardRef<AlertDialogDescriptionElement, AlertDialogDescriptionProps>((props, forwardedRef) => (
  <AlertDialogPrimitive.Description asChild>
    <Text as="p" size="3" {...props} asChild={false} ref={forwardedRef} />
  </AlertDialogPrimitive.Description>
));
AlertDialogDescription.displayName = 'AlertDialog.Description';

type AlertDialogActionElement = React.ElementRef<typeof AlertDialogPrimitive.Action>;
interface AlertDialogActionProps extends ComponentPropsWithout<typeof AlertDialogPrimitive.Action, RemovedProps> {}
const AlertDialogAction = React.forwardRef<AlertDialogActionElement, AlertDialogActionProps>(({ children, ...props }, forwardedRef) => (
  <AlertDialogPrimitive.Action {...props} ref={forwardedRef} asChild>
    {requireReactElement(children)}
  </AlertDialogPrimitive.Action>
));
AlertDialogAction.displayName = 'AlertDialog.Action';

type AlertDialogCancelElement = React.ElementRef<typeof AlertDialogPrimitive.Cancel>;
interface AlertDialogCancelProps extends ComponentPropsWithout<typeof AlertDialogPrimitive.Cancel, RemovedProps> {}
const AlertDialogCancel = React.forwardRef<AlertDialogCancelElement, AlertDialogCancelProps>(({ children, ...props }, forwardedRef) => (
  <AlertDialogPrimitive.Cancel {...props} ref={forwardedRef} asChild>
    {requireReactElement(children)}
  </AlertDialogPrimitive.Cancel>
));
AlertDialogCancel.displayName = 'AlertDialog.Cancel';

export {
  AlertDialogRoot as Root,
  AlertDialogTrigger as Trigger,
  AlertDialogContent as Content,
  AlertDialogTitle as Title,
  AlertDialogDescription as Description,
  AlertDialogAction as Action,
  AlertDialogCancel as Cancel,
};

export type {
  AlertDialogRootProps as RootProps,
  AlertDialogTriggerProps as TriggerProps,
  AlertDialogContentProps as ContentProps,
  AlertDialogTitleProps as TitleProps,
  AlertDialogDescriptionProps as DescriptionProps,
  AlertDialogActionProps as ActionProps,
  AlertDialogCancelProps as CancelProps,
};
