#!/usr/bin/env node

/**
 * Generate JSON schemas from Zod schemas for AI/Copilot integration
 *
 * This script converts Zod schemas to JSON Schema format that can be consumed by:
 * - Cursor/Copilot for better autocomplete
 * - RAG systems for semantic search
 * - Documentation generation tools
 * - API validation systems
 *
 * Usage: node scripts/generate-json-schemas.cjs
 */

const { z } = require('zod');
const { writeFileSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

// Get current directory
const currentDir = dirname(__filename);

// Create output directory
const schemasDir = join(currentDir, '../schemas');
mkdirSync(schemasDir, { recursive: true });

// Import schemas using require (CommonJS)
const {
  BaseButtonSchema,
  ButtonSchema,
  IconButtonSchema,
  ToggleButtonSchema,
  ToggleIconButtonSchema,
} = require('../dist/cjs/components/schemas/index.js');

// Schema mapping
const schemas = {
  'base-button': BaseButtonSchema,
  button: ButtonSchema,
  'icon-button': IconButtonSchema,
  'toggle-button': ToggleButtonSchema,
  'toggle-icon-button': ToggleIconButtonSchema,
};

// Functions can't be expressed in JSON Schema. Mark them during conversion so
// they can be dropped afterwards, matching the output of the old
// zod-to-json-schema generator.
const DROP = '__kookieDrop';

function dropMarked(node) {
  if (Array.isArray(node)) {
    node.forEach(dropMarked);
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (node.properties) {
    for (const [key, value] of Object.entries(node.properties)) {
      if (value && value[DROP]) {
        delete node.properties[key];
        if (Array.isArray(node.required)) {
          node.required = node.required.filter((k) => k !== key);
        }
      }
    }
  }
  Object.values(node).forEach(dropMarked);
}

// Wrap in `$ref` + `definitions`, the shape consumers of `schemas-json` already read
function toJsonSchema(schema, definitionName) {
  const body = z.toJSONSchema(schema, {
    target: 'draft-7',
    // Props with defaults are still optional for callers
    io: 'input',
    unrepresentable: 'any',
    override: (ctx) => {
      const { type } = ctx.zodSchema._zod.def;
      if (type === 'function') ctx.jsonSchema[DROP] = true;
      // Input mode leaves objects open; keep them closed like the previous output
      if (type === 'object' && !('additionalProperties' in ctx.jsonSchema)) {
        ctx.jsonSchema.additionalProperties = false;
      }
    },
  });
  delete body.$schema;
  dropMarked(body);
  return { $ref: `#/definitions/${definitionName}`, definitions: { [definitionName]: body } };
}

// Generate JSON schemas
const generatedSchemas = {};

for (const [name, schema] of Object.entries(schemas)) {
  try {
    const jsonSchema = toJsonSchema(schema, `${name.charAt(0).toUpperCase() + name.slice(1)}Schema`);

    // Add metadata
    jsonSchema.$schema = 'https://json-schema.org/draft/2020-12/schema';
    jsonSchema.title = `${name.charAt(0).toUpperCase() + name.slice(1)} Component Props`;
    jsonSchema.description = `Props schema for the ${name} component in Kookie UI`;
    jsonSchema.version = '1.0.0';
    jsonSchema.source = 'Zod schema';
    // Deliberately no `generatedAt`: the schemas are committed to the
    // repository, so a timestamp would make every build dirty them with a
    // change that carries no information.

    // Write individual schema file + ambient d.ts for TS resolution
    const filePath = join(schemasDir, `${name}.json`);
    writeFileSync(filePath, JSON.stringify(jsonSchema, null, 2));
    const dtsPath = join(schemasDir, `${name}.d.ts`);
    writeFileSync(dtsPath, `declare const schema: any;\nexport default schema;\n`);

    generatedSchemas[name] = jsonSchema;

    console.log(`✅ Generated ${name}.json`);
  } catch (error) {
    console.error(`❌ Failed to generate ${name}.json:`, error.message);
  }
}

// Generate combined schema index
const combinedSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Kookie UI Button Components',
  description: 'Complete JSON Schema collection for all button components in Kookie UI',
  version: '1.0.0',
  source: 'Zod schemas',
  components: generatedSchemas,
};

const indexPath = join(schemasDir, 'index.json');
writeFileSync(indexPath, JSON.stringify(combinedSchema, null, 2));
const indexDtsPath = join(schemasDir, 'index.d.ts');
writeFileSync(indexDtsPath, `declare const schemas: any;\nexport default schemas;\n`);

console.log(`✅ Generated index.json with ${Object.keys(generatedSchemas).length} schemas`);
console.log(`📁 Schemas saved to: ${schemasDir}`);

// Generate TypeScript definitions for the schemas
const tsDefinitions = `/**
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

export interface KookieUIButtonSchemas {
  'base-button': BaseButtonJsonSchema;
  'button': ButtonJsonSchema;
  'icon-button': IconButtonJsonSchema;
  'toggle-button': ToggleButtonJsonSchema;
  'toggle-icon-button': ToggleIconButtonJsonSchema;
}

export type ButtonComponentName = keyof KookieUIButtonSchemas;
`;

const tsPath = join(schemasDir, 'schemas.d.ts');
writeFileSync(tsPath, tsDefinitions);

console.log(`✅ Generated TypeScript definitions`);
console.log(`🎉 JSON schema generation complete!`);
