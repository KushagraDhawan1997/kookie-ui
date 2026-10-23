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
export interface ToggleJsonSchema extends BaseButtonJsonSchema {}

export interface KookieUIButtonSchemas {
  'base-button': BaseButtonJsonSchema;
  'button': ButtonJsonSchema;
  'toggle': ToggleJsonSchema;
}

export type ButtonComponentName = keyof KookieUIButtonSchemas;
