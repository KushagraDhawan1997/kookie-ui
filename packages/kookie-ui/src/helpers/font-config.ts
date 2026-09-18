/**
 * Runtime font configuration for Kookie UI.
 *
 * This is a thin, typed wrapper over the CSS tokens in `styles/tokens/font-family.css` —
 * it writes the same variables you would write by hand, and nothing else. Prefer plain CSS
 * where you can; reach for this when the stacks are only known at runtime (a theme editor,
 * a user-selectable typeface).
 *
 * Two tiers, matching the CSS:
 *
 *   - `stacks` — which typefaces exist: `sans`, `mono`, `serif`. Written to `:root`.
 *   - `roles`  — which stack each role uses: `body`, `heading`, `code`, `strong`, `em`,
 *                `quote`. Written to the theme element, since roles are per-theme.
 */

/** Tier 1 — the typefaces available to the theme. */
export interface FontStacks {
  /** Sans-serif stack. Backs `font="sans"` and, by default, body text. */
  sans?: string;
  /** Monospace stack. Backs `font="mono"` and `Code`. */
  mono?: string;
  /** Serif stack. Backs `font="serif"`, `Em` and `Quote`. */
  serif?: string;
}

/** Tier 2 — which stack each role of text uses. */
export interface FontRoles {
  /** Body text: `Text`, inputs, buttons, and anything that does not opt out. */
  body?: string;
  /** `Heading`. Follows `body` when left unset. */
  heading?: string;
  /** `Code`. */
  code?: string;
  /** `Strong`. */
  strong?: string;
  /** `Em`. */
  em?: string;
  /** `Quote`. */
  quote?: string;
}

export interface FontConfig {
  stacks?: FontStacks;
  roles?: FontRoles;
}

/** CSS custom properties backing each stack. Declared on `:root`. */
export const FONT_STACK_VARIABLES = {
  sans: '--font-sans',
  mono: '--font-mono',
  serif: '--font-serif',
} as const satisfies Record<keyof FontStacks, `--font-${string}`>;

/** CSS custom properties backing each role. Declared on the theme element. */
export const FONT_ROLE_VARIABLES = {
  body: '--font-body',
  heading: '--font-heading',
  code: '--font-code',
  strong: '--font-strong',
  em: '--font-em',
  quote: '--font-quote',
} as const satisfies Record<keyof FontRoles, `--font-${string}`>;

/**
 * Ready-made stacks, each ending in a system fallback.
 *
 * The webfont entries assume the face is already loaded — via
 * `import '@kushagradhawan/kookie-ui/fonts.css'`, `next/font`, or your own `@font-face`.
 * Kookie's core stylesheet deliberately loads none.
 */
export const FONT_STACKS = {
  // Sans
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI (Custom)', Roboto, 'Helvetica Neue', system-ui, sans-serif",
  inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI (Custom)', Roboto, system-ui, sans-serif",
  poppins: "'Poppins', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  openSans: "'Open Sans (Custom)', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",

  // Mono
  systemMono: "'Menlo', 'Consolas (Custom)', 'Bitstream Vera Sans Mono', monospace",
  jetbrainsMono: "'JetBrains Mono', 'Menlo', 'Consolas (Custom)', monospace",
  firaCode: "'Fira Code', 'Menlo', 'Consolas (Custom)', monospace",
  sourceCodePro: "'Source Code Pro', 'Menlo', 'Consolas (Custom)', monospace",

  // Serif
  systemSerif: "'Times New Roman', 'Times', 'Georgia', 'Cambria', serif",
  playfair: "'Playfair Display', 'Times New Roman', 'Georgia', serif",
  georgia: "'Georgia', 'Times New Roman', 'Times', serif",
  lora: "'Lora', 'Georgia', 'Times New Roman', serif",
} as const;

function write<K extends string>(target: HTMLElement, variables: Record<K, string>, values: Partial<Record<K, string>>) {
  for (const key of Object.keys(variables) as K[]) {
    const value = values[key];
    if (value) target.style.setProperty(variables[key], value);
  }
}

function clear(target: HTMLElement, variables: Record<string, string>) {
  for (const variable of Object.values(variables)) {
    target.style.removeProperty(variable);
  }
}

/**
 * Apply a font configuration.
 *
 * Stacks land on `:root` and roles on `themeElement`, mirroring where the stylesheet
 * declares them — writing a role to `:root` would not survive, because the theme
 * element declares its own.
 *
 * @example
 * ```ts
 * // Serif headings over a sans body
 * applyFontConfig({
 *   stacks: { sans: FONT_STACKS.inter, serif: FONT_STACKS.playfair },
 *   roles: { heading: 'var(--font-serif)' },
 * });
 * ```
 */
export function applyFontConfig(
  config: FontConfig,
  { root = document.documentElement, themeElement = document.querySelector<HTMLElement>('.radix-themes') }: { root?: HTMLElement; themeElement?: HTMLElement | null } = {},
): void {
  if (config.stacks) write(root, FONT_STACK_VARIABLES, config.stacks);
  if (config.roles && themeElement) write(themeElement, FONT_ROLE_VARIABLES, config.roles);
}

/**
 * Render a font configuration as a CSS string, for injecting into a stylesheet or
 * emitting server-side.
 */
export function generateFontCSS(config: FontConfig): string {
  const blocks: string[] = [];

  const stacks = Object.entries(config.stacks ?? {}).filter(([, value]) => value);
  if (stacks.length) {
    blocks.push([':root {', ...stacks.map(([key, value]) => `  ${FONT_STACK_VARIABLES[key as keyof FontStacks]}: ${value};`), '}'].join('\n'));
  }

  const roles = Object.entries(config.roles ?? {}).filter(([, value]) => value);
  if (roles.length) {
    blocks.push(['.radix-themes {', ...roles.map(([key, value]) => `  ${FONT_ROLE_VARIABLES[key as keyof FontRoles]}: ${value};`), '}'].join('\n'));
  }

  return blocks.join('\n\n');
}

/** Drop every inline font override, falling back to the stylesheet's defaults. */
export function resetFonts({ root = document.documentElement, themeElement = document.querySelector<HTMLElement>('.radix-themes') }: { root?: HTMLElement; themeElement?: HTMLElement | null } = {}): void {
  clear(root, FONT_STACK_VARIABLES);
  if (themeElement) clear(themeElement, FONT_ROLE_VARIABLES);
}

/** Read the stacks and roles currently in effect. */
export function getCurrentFontConfig({ themeElement = document.querySelector<HTMLElement>('.radix-themes') }: { themeElement?: HTMLElement | null } = {}): Required<FontConfig> {
  // Roles resolve against the theme element, so read both tiers from it — it inherits
  // the stacks from `:root` and is the only place the roles are declared.
  const computed = getComputedStyle(themeElement ?? document.documentElement);
  const read = (variable: string) => computed.getPropertyValue(variable).trim() || undefined;

  return {
    stacks: {
      sans: read(FONT_STACK_VARIABLES.sans),
      mono: read(FONT_STACK_VARIABLES.mono),
      serif: read(FONT_STACK_VARIABLES.serif),
    },
    roles: {
      body: read(FONT_ROLE_VARIABLES.body),
      heading: read(FONT_ROLE_VARIABLES.heading),
      code: read(FONT_ROLE_VARIABLES.code),
      strong: read(FONT_ROLE_VARIABLES.strong),
      em: read(FONT_ROLE_VARIABLES.em),
      quote: read(FONT_ROLE_VARIABLES.quote),
    },
  };
}
