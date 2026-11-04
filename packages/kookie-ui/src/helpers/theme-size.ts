/**
 * The pure half of the theme size: the type, the default and the clamp. Server-safe.
 *
 * The context and the hooks that read it live in `hooks/theme-size.ts`, a client module, so there
 * is one `ThemeSizeContext` and importing `/helpers` from a server component does not call
 * `createContext`.
 */

type ThemeSize = '1' | '2' | '3' | '4';

/** The rest of the 1-4 index when no Theme states a size. */
const THEME_SIZE_DEFAULT: ThemeSize = '2';

/**
 * Maps the theme size onto a component's own range: the value itself when the
 * component has it, otherwise the nearest end of the range (`4` on a 1-3 scale
 * is `3`, on a 1-2 scale it is `2`).
 */
function clampSize(size: ThemeSize, values: readonly string[]): string {
  if (values.includes(size)) return size;
  const n = Number(size);
  let nearest = values[0];
  let distance = Infinity;
  for (let i = 0; i < values.length; i++) {
    const d = Math.abs(Number(values[i]) - n);
    if (d < distance) {
      distance = d;
      nearest = values[i];
    }
  }
  return nearest;
}

export { THEME_SIZE_DEFAULT, clampSize };
export type { ThemeSize };
