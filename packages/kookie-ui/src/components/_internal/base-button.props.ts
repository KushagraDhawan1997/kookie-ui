import { asChildPropDef } from '../../props/as-child.prop.js';
import { accentColorPropDef } from '../../props/color.prop.js';
import { radiusPropDef } from '../../props/radius.prop.js';

import type { PropDef } from '../../props/prop-def.js';

/**
 * Available button sizes for responsive design
 * Size 1: 24px - Compact for toolbars and dense interfaces
 * Size 2: 32px - Standard for most interface contexts
 * Size 3: 40px - Large for important actions and mobile touch targets
 * Size 4: 48px - Extra large for hero sections and maximum impact
 */
const sizes = ['1', '2', '3', '4'] as const;

/**
 * Available button variants for different visual contexts
 * - raised: lifted off its ground, with an edge and a shadow (the default)
 * - solid: Primary actions that should be noticed first
 * - soft: Content-heavy interfaces, natural integration
 * - surface: Elevated appearance with subtle depth
 * - outline: Secondary actions that support primary actions
 * - ghost: Utility functions that don't compete for attention
 */
const variants = ['raised', 'solid', 'soft', 'surface', 'outline', 'ghost'] as const;

/**
 * Base button prop definitions that define the component's API
 * 
 * These props are used by all button variants (Button, IconButton, etc.)
 * to ensure consistent behavior and styling across the design system.
 * 
 * Key features:
 * - Responsive sizing with mobile-first approach
 * - Six visual variants for different interface contexts
 * - Comprehensive color system with semantic meanings
 * - Loading states with automatic accessibility
 * - Polymorphic rendering support via asChild
 * 
 * @example
 * ```tsx
 * // Basic button with default props
 * <BaseButton>Click me</BaseButton>
 * 
 * // Button with custom size and variant
 * <BaseButton size="3" variant="solid">Primary Action</BaseButton>
 * 
 * // Button with loading state
 * <BaseButton loading>Processing...</BaseButton>
 * ```
 */
const baseButtonPropDefs = {
  ...asChildPropDef,
  /**
   * Button size for responsive design and interface density
   * Supports responsive objects: { initial: '1', sm: '2', md: '3', lg: '4' }
   */
  size: { type: 'enum', className: 'rt-r-size', values: sizes, default: '2', responsive: true },
  /**
   * Visual variant that determines the button's appearance and context
   */
  variant: { type: 'enum', className: 'rt-variant', values: variants, default: 'raised' },
  ...accentColorPropDef,
  ...radiusPropDef,
  /**
   * Loading state that shows a spinner and disables interaction
   * Automatically sets disabled=true and provides accessibility announcements
   */
  loading: { type: 'boolean', className: 'rt-loading', default: false },
  /**
   * Full width mode that expands the button to fill its container
   * Useful for mobile layouts and form submissions
   */
  fullWidth: { type: 'boolean', className: 'rt-full-width', default: false },
  /**
   * Flush mode that removes visual padding for seamless text integration
   * Only effective with ghost variant
   */
  flush: { type: 'boolean', default: false },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  loading: PropDef<boolean>;
  fullWidth: PropDef<boolean>;
  flush: PropDef<boolean>;
};

export { baseButtonPropDefs };
