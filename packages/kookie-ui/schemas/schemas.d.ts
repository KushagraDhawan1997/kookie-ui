/**
 * Generated TypeScript definitions for JSON schemas
 * This file is auto-generated - do not edit manually
 */

export interface BaseButtonJsonSchema {
  $schema: string;
  title: string;
  description: string;
  type: 'object';
  properties: Record<string, any>;
  required?: string[];
  additionalProperties: boolean;
}

export interface ButtonJsonSchema extends BaseButtonJsonSchema {}
export interface IconButtonJsonSchema extends BaseButtonJsonSchema {}
export interface ToggleButtonJsonSchema extends BaseButtonJsonSchema {}
export interface ToggleIconButtonJsonSchema extends BaseButtonJsonSchema {}
export interface ShellRootJsonSchema extends BaseButtonJsonSchema {}
export interface ShellHeaderJsonSchema extends BaseButtonJsonSchema {}
export interface ShellRailJsonSchema extends BaseButtonJsonSchema {}
export interface ShellPanelJsonSchema extends BaseButtonJsonSchema {}
export interface ShellSidebarJsonSchema extends BaseButtonJsonSchema {}
export interface ShellContentJsonSchema extends BaseButtonJsonSchema {}
export interface ShellInspectorJsonSchema extends BaseButtonJsonSchema {}
export interface ShellBottomJsonSchema extends BaseButtonJsonSchema {}
export interface ShellTriggerJsonSchema extends BaseButtonJsonSchema {}
export interface ShellHandleJsonSchema extends BaseButtonJsonSchema {}

export interface KookieUIComponentSchemas {
  'base-button': BaseButtonJsonSchema;
  'button': ButtonJsonSchema;
  'icon-button': IconButtonJsonSchema;
  'toggle-button': ToggleButtonJsonSchema;
  'toggle-icon-button': ToggleIconButtonJsonSchema;
  'shell-root': ShellRootJsonSchema;
  'shell-header': ShellHeaderJsonSchema;
  'shell-rail': ShellRailJsonSchema;
  'shell-panel': ShellPanelJsonSchema;
  'shell-sidebar': ShellSidebarJsonSchema;
  'shell-content': ShellContentJsonSchema;
  'shell-inspector': ShellInspectorJsonSchema;
  'shell-bottom': ShellBottomJsonSchema;
  'shell-trigger': ShellTriggerJsonSchema;
  'shell-handle': ShellHandleJsonSchema;
}

export type ComponentName = keyof KookieUIComponentSchemas;
