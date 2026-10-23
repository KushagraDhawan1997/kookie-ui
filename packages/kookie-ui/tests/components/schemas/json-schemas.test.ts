import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import * as schemas from '../../../src/components/schemas';

/**
 * The JSON under `schemas/` ships as `./schemas-json/*` and is meant to be generated from the
 * Zod source by scripts/generate-json-schemas.cjs. Hand edits drift (0.17 and 0.21 left
 * `classic`, `override` and `flush` in, and `raised`, `iconOnly`, `emphasis` out). This
 * converts the source the way the script does and holds every committed file to it.
 */
const DROP = '__kookieDrop';

function dropMarked(node: unknown): void {
  if (Array.isArray(node)) return node.forEach(dropMarked);
  if (!node || typeof node !== 'object') return;
  const obj = node as { properties?: Record<string, Record<string, unknown>>; required?: string[] };
  if (obj.properties) {
    for (const [key, value] of Object.entries(obj.properties)) {
      if (value && value[DROP]) {
        delete obj.properties[key];
        if (Array.isArray(obj.required)) obj.required = obj.required.filter((k) => k !== key);
      }
    }
  }
  Object.values(node).forEach(dropMarked);
}

function convert(schema: z.ZodType) {
  const body = z.toJSONSchema(schema, {
    target: 'draft-7',
    io: 'input',
    unrepresentable: 'any',
    override: (ctx) => {
      const { type } = (ctx.zodSchema as unknown as { _zod: { def: { type: string } } })._zod.def;
      if (type === 'function') (ctx.jsonSchema as Record<string, unknown>)[DROP] = true;
      if (type === 'object' && !('additionalProperties' in ctx.jsonSchema)) ctx.jsonSchema.additionalProperties = false;
    },
  }) as Record<string, unknown>;
  delete body.$schema;
  dropMarked(body);
  return body;
}

const files: Record<string, z.ZodType> = {
  'base-button': schemas.BaseButtonSchema,
  button: schemas.ButtonSchema,
  toggle: schemas.ToggleSchema,
  'shell-root': schemas.ShellRootSchema,
  'shell-header': schemas.ShellHeaderSchema,
  'shell-rail': schemas.ShellRailSchema,
  'shell-panel': schemas.ShellPanelSchema,
  'shell-sidebar': schemas.ShellSidebarSchema,
  'shell-content': schemas.ShellContentSchema,
  'shell-inspector': schemas.ShellInspectorSchema,
  'shell-bottom': schemas.ShellBottomSchema,
  'shell-trigger': schemas.ShellTriggerSchema,
  'shell-handle': schemas.ShellHandleSchema,
};

const dir = join(__dirname, '../../../schemas');
const read = (name: string) => JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8'));
const definitionName = (name: string) => `${name.charAt(0).toUpperCase() + name.slice(1)}Schema`;

describe('committed JSON schemas match the Zod source', () => {
  for (const [name, schema] of Object.entries(files)) {
    it(`${name}.json`, () => {
      const expected = convert(schema);
      expect(read(name).definitions[definitionName(name)]).toEqual(expected);
      expect(read('index').components[name].definitions[definitionName(name)]).toEqual(expected);
    });
  }
});

describe('ButtonSchema', () => {
  it('rejects an iconOnly button with no name, as Button does', () => {
    expect(schemas.ButtonSchema.safeParse({ iconOnly: true }).success).toBe(false);
    expect(schemas.ButtonSchema.safeParse({ iconOnly: true, 'aria-label': 'Save' }).success).toBe(true);
    expect(schemas.ButtonSchema.safeParse({ iconOnly: true, 'aria-labelledby': 'l' }).success).toBe(true);
    expect(schemas.ButtonSchema.safeParse({}).success).toBe(true);
  });

  it('Toggle keeps its own name rule', () => {
    expect(schemas.ToggleSchema.safeParse({ iconOnly: true }).success).toBe(false);
  });
});
