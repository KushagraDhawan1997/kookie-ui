import type { PropDef } from '../props/prop-def.js';

/**
 * A prop def pre-processed into the exact shape `extractProps` needs at render
 * time. Everything that can be derived from the static prop def — enum
 * membership sets, whether the def is responsive, whether it carries a default
 * — is computed once here instead of on every render.
 */
interface CompiledPropDef {
  key: string;
  type: PropDef['type'];
  default: unknown;
  hasDefault: boolean;
  responsive: boolean;
  className?: string;
  customProperties?: `--${string}`[];
  parseValue?: (value: string) => string | undefined;
  /** The prop def's own enum values, kept for the responsive class name helpers. */
  values: readonly string[];
  /** O(1) membership for `values`. */
  valueSet: ReadonlySet<string>;
  /**
   * `values` plus the default, used to coerce invalid enum values back to the
   * default. Only present for `type: 'enum'` — `'enum | string'` props accept
   * arbitrary strings and must not be coerced.
   */
  enumValueSet?: ReadonlySet<unknown>;
}

interface CompiledPropDefs {
  /** Defs that contribute a class name and/or custom properties. */
  styling: CompiledPropDef[];
  /**
   * Defs that pass through to the element but still need a default applied or
   * an invalid enum value coerced. Defs that can do neither are omitted
   * entirely — they are already correct as passed.
   */
  passthrough: CompiledPropDef[];
  /** Keys consumed by `styling`, so they can be skipped when copying props. */
  stylingKeys: ReadonlySet<string>;
}

const EMPTY_VALUES: readonly string[] = [];
const EMPTY_SET: ReadonlySet<string> = new Set();

function compile(propDefs: readonly Record<string, PropDef>[]): CompiledPropDefs {
  const merged: Record<string, PropDef> = Object.assign({}, ...propDefs);
  const styling: CompiledPropDef[] = [];
  const passthrough: CompiledPropDef[] = [];
  const stylingKeys = new Set<string>();

  for (const key in merged) {
    // The PropDef union is narrowed per-field below; reading the optional
    // members off the union directly is what the runtime actually needs.
    const def = merged[key] as PropDef & {
      default?: unknown;
      values?: readonly string[];
      className?: string;
      customProperties?: `--${string}`[];
      parseValue?: (value: string) => string | undefined;
      responsive?: true;
    };

    const values = def.values ?? EMPTY_VALUES;
    const compiled: CompiledPropDef = {
      key,
      type: def.type,
      default: def.default,
      hasDefault: def.default !== undefined,
      responsive: 'responsive' in def,
      className: def.className,
      customProperties: def.customProperties,
      parseValue: def.parseValue,
      values,
      valueSet: values.length > 0 ? new Set(values) : EMPTY_SET,
      enumValueSet: def.type === 'enum' ? new Set<unknown>([def.default, ...values]) : undefined,
    };

    if (def.className) {
      styling.push(compiled);
      stylingKeys.add(key);
    } else if (compiled.hasDefault || def.type === 'enum') {
      // Anything else is copied through untouched, so there is nothing to do.
      passthrough.push(compiled);
    }
  }

  return { styling, passthrough, stylingKeys };
}

interface CacheNode {
  children: WeakMap<object, CacheNode>;
  compiled?: CompiledPropDefs;
}

const cacheRoot: CacheNode = { children: new WeakMap() };

/**
 * Compiles a set of prop defs, memoized on the identity of the prop def objects
 * themselves. Components always pass the same module-level constants, so after
 * the first render of a given component this is a couple of WeakMap lookups
 * instead of merging 50-odd prop defs into a fresh object.
 */
function getCompiledPropDefs(propDefs: readonly Record<string, PropDef>[]): CompiledPropDefs {
  let node = cacheRoot;

  for (let i = 0; i < propDefs.length; i++) {
    const propDef = propDefs[i];
    let child = node.children.get(propDef);
    if (child === undefined) {
      child = { children: new WeakMap() };
      node.children.set(propDef, child);
    }
    node = child;
  }

  return (node.compiled ??= compile(propDefs));
}

export { getCompiledPropDefs };
export type { CompiledPropDef, CompiledPropDefs };
