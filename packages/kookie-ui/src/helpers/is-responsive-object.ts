import type { Responsive, Breakpoint } from '../props/prop-def.js';

// Use a Set for O(1) lookup instead of array.includes() which is O(n)
const breakpointSet = new Set<string>(['initial', 'xs', 'sm', 'md', 'lg', 'xl']);

export function isResponsiveObject<Value extends string>(
  obj: Responsive<Value | Omit<string, Value>> | undefined
): obj is Record<Breakpoint, string> {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  // Use for...in to avoid Object.keys() array allocation
  for (const key in obj) {
    if (breakpointSet.has(key)) {
      return true;
    }
  }
  return false;
}
