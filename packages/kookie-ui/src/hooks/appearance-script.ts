/**
 * The pre-paint half of light and dark mode (see `use-appearance.ts`). Kept in its own module
 * with no client directive, so a server component such as a Next.js root layout can import the
 * string and inline it in `<head>`.
 */

const APPEARANCE_STORAGE_KEY = 'kookie-appearance';

/**
 * Inline this in `<head>`, before any stylesheet paints, e.g.
 * `<script dangerouslySetInnerHTML={{ __html: appearanceScript }} />`.
 *
 * Storage is read inside its own try/catch: browsers that block site data throw on access,
 * and that must not skip the stamp. `matchMedia` always answers.
 */
const appearanceScript = `(function () {
  var e = document.documentElement;
  var a = null;
  try { a = localStorage.getItem(${JSON.stringify(APPEARANCE_STORAGE_KEY)}); } catch (err) {}
  var dark = a === "light" ? false : a === "dark" ? true : matchMedia("(prefers-color-scheme: dark)").matches;
  var mode = dark ? "dark" : "light";
  e.classList.remove("light", "dark");
  e.classList.add(mode);
  e.setAttribute("data-appearance", mode);
  e.style.colorScheme = mode;
})();`;

export { appearanceScript, APPEARANCE_STORAGE_KEY };
