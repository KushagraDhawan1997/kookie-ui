---
name: React Best Practices
description: React/Next.js performance optimization from Vercel. Use when writing, reviewing, or refactoring React code.
---

# React Best Practices

Comprehensive performance optimization guide for React and Next.js applications, containing 45 rules across 8 categories prioritized by impact.

## When to Apply

Reference these guidelines when:
- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Rule Categories by Priority

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Eliminating Waterfalls | CRITICAL |
| 2 | Bundle Size Optimization | CRITICAL |
| 3 | Server-Side Performance | HIGH |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH |
| 5 | Re-render Optimization | MEDIUM |
| 6 | Rendering Performance | MEDIUM |
| 7 | JavaScript Performance | LOW-MEDIUM |
| 8 | Advanced Patterns | LOW |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)
- Defer await until needed
- Use Promise.all() for independent operations
- Use better-all for partial dependencies
- Start promises early, await late in API routes
- Use Suspense to stream content

### 2. Bundle Size (CRITICAL)
- Import directly, avoid barrel files
- Use next/dynamic for heavy components
- Load analytics/logging after hydration
- Load modules only when feature is activated
- Preload on hover/focus for perceived speed

### 3. Server-Side Performance (HIGH)
- Use React.cache() for per-request deduplication
- Use LRU cache for cross-request caching
- Minimize data passed to client components
- Restructure components to parallelize fetches
- Use after() for non-blocking operations

### 4. Client-Side Data Fetching (MEDIUM-HIGH)
- Use SWR for automatic request deduplication
- Deduplicate global event listeners

### 5. Re-render Optimization (MEDIUM)
- Don't subscribe to state only used in callbacks
- Extract expensive work into memoized components
- Use primitive dependencies in effects
- Subscribe to derived booleans, not raw values
- Use functional setState for stable callbacks
- Pass function to useState for expensive values
- Use startTransition for non-urgent updates

### 6. Rendering Performance (MEDIUM)
- Animate div wrapper, not SVG element
- Use content-visibility for long lists
- Extract static JSX outside components
- Reduce SVG coordinate precision
- Use inline script for client-only data
- Use Activity component for show/hide
- Use ternary, not && for conditionals

### 7. JavaScript Performance (LOW-MEDIUM)
- Group CSS changes via classes or cssText
- Build Map for repeated lookups
- Cache object properties in loops
- Cache function results in module-level Map
- Cache localStorage/sessionStorage reads
- Combine multiple filter/map into one loop
- Check array length before expensive comparison
- Return early from functions
- Hoist RegExp creation outside loops
- Use loop for min/max instead of sort
- Use Set/Map for O(1) lookups
- Use toSorted() for immutability

### 8. Advanced Patterns (LOW)
- Store event handlers in refs
- useLatest for stable callback refs

---

For detailed explanations and code examples, see [REFERENCE.md](REFERENCE.md).
