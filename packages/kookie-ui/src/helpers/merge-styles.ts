type InlineStyle =
  | React.CSSProperties
  | Record<string, string | number | null | undefined>
  | undefined;

// Merges CSS styles like `classNames` merges CSS classes
// Optimized to avoid object spread in loop - uses Object.assign for in-place mutation
export function mergeStyles(...styles: Array<InlineStyle>): InlineStyle {
  let result: Record<string, string | number | null | undefined> | undefined;

  for (const style of styles) {
    if (style) {
      if (result === undefined) {
        // First non-empty style - create result object
        result = {};
      }
      Object.assign(result, style);
    }
  }

  return result;
}
