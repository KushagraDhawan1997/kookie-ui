import * as React from 'react';
import classNames from 'classnames';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { dialogContentPropDefs } from './dialog.props.js';
import { Heading } from './heading.js';
import { Text } from './text.js';
import { Theme } from './theme.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../hooks/theme-size.js';
import { requireReactElement } from '../helpers/require-react-element.js';
import { useBodyPointerEventsCleanup } from '../hooks/use-body-pointer-events-cleanup.js';

import type { DialogContentOwnProps } from './dialog.props.js';
import type { ComponentPropsWithout, RemovedProps, ComponentPropsAs } from '../helpers/component-props.js';

interface DialogRootProps extends ComponentPropsWithout<typeof DialogPrimitive.Root, 'modal'> {}
const DialogRoot: React.FC<DialogRootProps> = (props) => <DialogPrimitive.Root {...props} modal />;
DialogRoot.displayName = 'Dialog.Root';

type DialogTriggerElement = React.ElementRef<typeof DialogPrimitive.Trigger>;
interface DialogTriggerProps extends ComponentPropsWithout<typeof DialogPrimitive.Trigger, RemovedProps> {}
const DialogTrigger = React.forwardRef<DialogTriggerElement, DialogTriggerProps>(({ children, ...props }, forwardedRef) => (
  <DialogPrimitive.Trigger {...props} ref={forwardedRef} asChild>
    {requireReactElement(children)}
  </DialogPrimitive.Trigger>
));
DialogTrigger.displayName = 'Dialog.Trigger';

// Split once at module scope. `extractProps` memoises on the identity of the
// prop def objects it is handed, so rebuilding these per render would recompile
// them on every render.
const { align: alignPropDef, ...contentPropDefs } = dialogContentPropDefs;
const alignPropDefs = { align: alignPropDef };

type DialogContentElement = React.ElementRef<typeof DialogPrimitive.Content>;
interface DialogContentProps extends ComponentPropsWithout<typeof DialogPrimitive.Content, RemovedProps>, DialogContentOwnProps {
  container?: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>['container'];
}
const DialogContent = React.forwardRef<DialogContentElement, DialogContentProps>(({ align, ...ownProps }, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, contentPropDefs.size);
  const { className: alignClassName } = extractProps({ align }, alignPropDefs);

  const { className, forceMount, container, onCloseAutoFocus, ...contentProps } = extractProps(props, contentPropDefs);

  // Cleanup stuck pointer-events on body
  useBodyPointerEventsCleanup();

  return (
    <DialogPrimitive.Portal container={container} forceMount={forceMount}>
      <Theme asChild>
        <DialogPrimitive.Overlay className="kui-BaseDialogOverlay kui-DialogOverlay">
          <div className="kui-BaseDialogScroll kui-DialogScroll">
            <div className={`kui-BaseDialogScrollPadding kui-DialogScrollPadding ${alignClassName}`}>
              <DialogPrimitive.Content
                {...contentProps}
                ref={forwardedRef}
                className={classNames('kui-BaseDialogContent', 'kui-DialogContent', className)}
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
        </DialogPrimitive.Overlay>
      </Theme>
    </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = 'Dialog.Content';

type DialogTitleElement = React.ElementRef<typeof Heading>;
type DialogTitleProps = ComponentPropsWithout<typeof Heading, 'asChild'>;
const DialogTitle = React.forwardRef<DialogTitleElement, DialogTitleProps>((props, forwardedRef) => (
  <DialogPrimitive.Title asChild>
    <Heading size="5" trim="start" {...props} asChild={false} ref={forwardedRef} />
  </DialogPrimitive.Title>
));
DialogTitle.displayName = 'Dialog.Title';

type DialogDescriptionElement = HTMLParagraphElement;
type DialogDescriptionProps = ComponentPropsAs<typeof Text, 'p'>;
const DialogDescription = React.forwardRef<DialogDescriptionElement, DialogDescriptionProps>((props, forwardedRef) => (
  <DialogPrimitive.Description asChild>
    <Text as="p" size="3" {...props} asChild={false} ref={forwardedRef} />
  </DialogPrimitive.Description>
));
DialogDescription.displayName = 'Dialog.Description';

type DialogCloseElement = React.ElementRef<typeof DialogPrimitive.Close>;
interface DialogCloseProps extends ComponentPropsWithout<typeof DialogPrimitive.Close, RemovedProps> {}
const DialogClose = React.forwardRef<DialogCloseElement, DialogCloseProps>(({ children, ...props }, forwardedRef) => (
  <DialogPrimitive.Close {...props} ref={forwardedRef} asChild>
    {requireReactElement(children)}
  </DialogPrimitive.Close>
));
DialogClose.displayName = 'Dialog.Close';

export { DialogRoot as Root, DialogTrigger as Trigger, DialogContent as Content, DialogTitle as Title, DialogDescription as Description, DialogClose as Close };

export type {
  DialogRootProps as RootProps,
  DialogTriggerProps as TriggerProps,
  DialogContentProps as ContentProps,
  DialogTitleProps as TitleProps,
  DialogDescriptionProps as DescriptionProps,
  DialogCloseProps as CloseProps,
};
