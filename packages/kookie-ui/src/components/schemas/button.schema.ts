import { z } from 'zod';
import { BaseButtonSchema } from './base-button.schema.js';

/**
 * Button Zod schema - Single source of truth for Button component props
 *
 * The Button component is the primary interactive element in the Kookie User Interface.
 * It provides six visual variants, four sizes, comprehensive color options, and built-in
 * tooltip support. The component automatically handles icon sizing, supports responsive
 * layouts, and provides accessibility compliance out of the box.
 *
 * @example
 * ```tsx
 * // Basic button validation
 * const props = ButtonSchema.parse({ variant: 'solid', size: '2' });
 *
 * // Button with tooltip
 * const tooltipProps = ButtonSchema.parse({
 *   tooltip: 'Save your progress',
 *   tooltipSide: 'top'
 * });
 *
 * // Polymorphic button as link
 * const linkProps = ButtonSchema.parse({
 *   as: 'a',
 *   href: '/dashboard',
 *   children: 'Go to Dashboard'
 * });
 * ```
 */
/**
 * Button's own fields, before the rules that span fields. Toggle extends this, since a
 * refined schema cannot be extended.
 */
export const ButtonObjectSchema = BaseButtonSchema.extend({
  /**
   * Content to display in the tooltip on hover/focus
   */
  tooltip: z.string().optional().describe('Content to display in the tooltip on hover/focus'),

  /**
   * Side of the button where the tooltip should appear
   * @default 'top'
   */
  tooltipSide: z
    .enum(['top', 'right', 'bottom', 'left'])
    .optional()
    .default('top')
    .describe('Side of the button where the tooltip should appear'),

  /**
   * The button's rank: loud is solid, medium is raised, quiet is ghost. Pass this or `variant`, not both.
   */
  emphasis: z.enum(['loud', 'medium', 'quiet']).optional().describe("The button's rank: loud (solid), medium (raised) or quiet (ghost). Not with variant."),

  /**
   * A square button holding only an icon. Needs an accessible name.
   */
  iconOnly: z.boolean().optional().default(false).describe('Square button holding only an icon; needs aria-label'),

  /**
   * Expands the button to fill its container. Ignored when iconOnly is set.
   */
  fullWidth: z.boolean().optional().default(false).describe('Expands the button to fill its container'),

  /**
   * Alignment of the tooltip relative to the button
   * @default 'center'
   */
  tooltipAlign: z
    .enum(['start', 'center', 'end'])
    .optional()
    .default('center')
    .describe('Alignment of the tooltip relative to the button'),

  /**
   * Delay before showing the tooltip (in milliseconds)
   */
  tooltipDelayDuration: z
    .number()
    .optional()
    .describe('Delay before showing the tooltip (in milliseconds)'),

  /**
   * Whether to disable hoverable content behavior
   * @default false
   */
  tooltipDisableHoverableContent: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to disable hoverable content behavior'),
}).strict();

export const ButtonSchema = ButtonObjectSchema.refine(
  (data) => !data.iconOnly || Boolean(data['aria-label'] || data['aria-labelledby']),
  {
    message: "An iconOnly Button must have either 'aria-label' or 'aria-labelledby' for accessibility",
    path: ['aria-label'],
  },
);

/**
 * Type derived from Button Zod schema
 * This ensures type safety and consistency with the schema
 */
export type ButtonProps = z.infer<typeof ButtonSchema>;

/**
 * Development-only helper to validate and normalize Button props
 * This function should only be used in development mode
 *
 * @param props - Props to validate and normalize
 * @returns Validated and normalized props
 *
 * @example
 * ```tsx
 * // In development, this will validate props and show helpful errors
 * const validatedProps = parseButtonProps({
 *   variant: 'invalid',
 *   tooltipSide: 'invalid'
 * });
 * // Throws validation errors for invalid enum values
 * ```
 */
export function parseButtonProps(props: unknown): ButtonProps {
  if (process.env.NODE_ENV === 'development') {
    return ButtonSchema.parse(props);
  }
  return props as ButtonProps;
}
