/**
 * The breakpoints' minimum widths in px, the same as the stylesheet's (`styles/breakpoints.css`).
 * Each applies from its width up, so `md` is 1024px and wider. For an app's own media queries and
 * matchMedia, so they switch at the same widths as Kookie's responsive props.
 */
const breakpoints = { xs: 520, sm: 768, md: 1024, lg: 1280, xl: 1640 } as const;

export { breakpoints };
