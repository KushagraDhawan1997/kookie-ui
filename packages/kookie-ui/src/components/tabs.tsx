import * as React from 'react';
import classNames from 'classnames';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { tabsListPropDefs } from './tabs.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';

import type { tabsContentPropDefs, tabsRootPropDefs } from './tabs.props.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type TabsRootElement = React.ElementRef<typeof TabsPrimitive.Root>;
type TabsRootOwnProps = GetPropDefTypes<typeof tabsRootPropDefs>;
interface TabsRootProps
  extends ComponentPropsWithout<typeof TabsPrimitive.Root, 'asChild' | 'color' | 'defaultChecked'>,
    TabsRootOwnProps {}
const TabsRoot = React.forwardRef<TabsRootElement, TabsRootProps>((props, forwardedRef) => {
  const { className, ...rootProps } = props;
  return (
    <TabsPrimitive.Root
      {...rootProps}
      ref={forwardedRef}
      className={classNames('kui-TabsRoot', className)}
    />
  );
});
TabsRoot.displayName = 'Tabs.Root';

type TabsListElement = React.ElementRef<typeof TabsPrimitive.List>;
type TabsListOwnProps = GetPropDefTypes<typeof tabsListPropDefs>;
interface TabsListProps
  extends ComponentPropsWithout<typeof TabsPrimitive.List, RemovedProps>,
    TabsListOwnProps {}
const TabsList = React.forwardRef<TabsListElement, TabsListProps>((ownProps, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, tabsListPropDefs.size);
  const { className, color, ...listProps } = extractProps(
    props,
    tabsListPropDefs,
  );
  return (
    <TabsPrimitive.List
      data-accent-color={color}
      {...listProps}
      asChild={false}
      ref={forwardedRef}
      className={classNames('kui-BaseTabList', 'kui-TabsList', className)}
    />
  );
});
TabsList.displayName = 'Tabs.List';

type TabsTriggerElement = React.ElementRef<typeof TabsPrimitive.Trigger>;
interface TabsTriggerProps
  extends ComponentPropsWithout<typeof TabsPrimitive.Trigger, RemovedProps> {}
const TabsTrigger = React.forwardRef<TabsTriggerElement, TabsTriggerProps>(
  (props, forwardedRef) => {
    const { className, children, ...triggerProps } = props;
    return (
      <TabsPrimitive.Trigger
        {...triggerProps}
        asChild={false}
        ref={forwardedRef}
        className={classNames('kui-reset', 'kui-BaseTabListTrigger', 'kui-TabsTrigger', className)}
      >
        <span className="kui-BaseTabListTriggerInner kui-TabsTriggerInner">{children}</span>
        <span className="kui-BaseTabListTriggerInnerHidden kui-TabsTriggerInnerHidden">
          {children}
        </span>
      </TabsPrimitive.Trigger>
    );
  },
);
TabsTrigger.displayName = 'Tabs.Trigger';

type TabsContentElement = React.ElementRef<typeof TabsPrimitive.Content>;
type TabsContentOwnProps = GetPropDefTypes<typeof tabsContentPropDefs>;
interface TabsContentProps
  extends ComponentPropsWithout<typeof TabsPrimitive.Content, RemovedProps>,
    TabsContentOwnProps {}
const TabsContent = React.forwardRef<TabsContentElement, TabsContentProps>(
  (props, forwardedRef) => {
    const { className, ...contentProps } = props;
    return (
      <TabsPrimitive.Content
        {...contentProps}
        ref={forwardedRef}
        className={classNames('kui-TabsContent', className)}
      />
    );
  },
);
TabsContent.displayName = 'Tabs.Content';

export { TabsRoot as Root, TabsList as List, TabsTrigger as Trigger, TabsContent as Content };
export type {
  TabsRootProps as RootProps,
  TabsListProps as ListProps,
  TabsTriggerProps as TriggerProps,
  TabsContentProps as ContentProps,
};
