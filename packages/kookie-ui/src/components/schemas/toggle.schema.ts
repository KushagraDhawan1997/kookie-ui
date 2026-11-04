import { z } from 'zod';
import { ButtonObjectSchema } from './button.schema.js';

/**
 * Toggle Zod schema - Single source of truth for Toggle component props
 *
 * Toggle is a Button that stays pressed, built on Radix UI's Toggle primitive. Set `iconOnly`
 * for a square toggle holding only an icon; it then needs `aria-label` or `aria-labelledby`.
 *
 * @example
 * ```tsx
 * const props = ToggleSchema.parse({ defaultPressed: false, variant: 'outline' });
 *
 * const iconProps = ToggleSchema.parse({ iconOnly: true, 'aria-label': 'Bold' });
 * ```
 */
export const ToggleSchema = ButtonObjectSchema.extend({
  /**
   * Controlled pressed state
   * When provided, the component is controlled and the pressed state is managed externally
   */
  pressed: z.boolean().optional().describe('Controlled pressed state'),

  /**
   * Callback when pressed state changes
   * Called with the new pressed state when the toggle is activated
   */
  onPressedChange: z.function().optional().describe('Callback when pressed state changes'),

  /**
   * Default pressed state for uncontrolled usage
   * Used as the initial pressed state when the component is uncontrolled
   */
  defaultPressed: z.boolean().optional().describe('Default pressed state for uncontrolled usage'),
})
  .refine((data) => !data.iconOnly || Boolean(data['aria-label'] || data['aria-labelledby']), {
    message: "An iconOnly Toggle must have either 'aria-label' or 'aria-labelledby' for accessibility",
    path: ['aria-label'],
  })
  .refine(
    (data) => {
      // If pressed is provided, onPressedChange should also be provided for controlled usage
      if (data.pressed !== undefined && data.onPressedChange === undefined) {
        return false;
      }
      return true;
    },
    {
      message: 'When using controlled mode (pressed prop), onPressedChange must also be provided',
      path: ['onPressedChange'],
    },
  )
  .refine(
    (data) => {
      // Cannot have both controlled and uncontrolled props
      if (data.pressed !== undefined && data.defaultPressed !== undefined) {
        return false;
      }
      return true;
    },
    {
      message:
        'Cannot use both controlled (pressed) and uncontrolled (defaultPressed) props together',
      path: ['pressed', 'defaultPressed'],
    },
  );

/**
 * Type derived from Toggle Zod schema
 * This ensures type safety and consistency with the schema
 */
export type ToggleProps = z.infer<typeof ToggleSchema>;

/**
 * Development-only helper to validate and normalize Toggle props
 * This function should only be used in development mode
 *
 * @param props - Props to validate and normalize
 * @returns Validated and normalized props
 *
 * @example
 * ```tsx
 * // In development, this will validate props and show helpful errors
 * const invalidProps = parseToggleProps({
 *   pressed: true,
 *   defaultPressed: false
 *   // Missing onPressedChange and conflicting controlled/uncontrolled
 * });
 * // Throws: "Cannot use both controlled (pressed) and uncontrolled (defaultPressed) props together"
 *
 * const validProps = parseToggleProps({
 *   pressed: true,
 *   onPressedChange: (pressed) => setPressed(pressed)
 * });
 * ```
 */
export function parseToggleProps(props: unknown): ToggleProps {
  if (process.env.NODE_ENV === 'development') {
    return ToggleSchema.parse(props);
  }
  return props as ToggleProps;
}
