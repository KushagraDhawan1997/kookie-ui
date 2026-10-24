import type { PropDef } from '../props/prop-def.js';

const sizes = ['1', '2', '3', '4'] as const;
const orientations = ['horizontal', 'vertical'] as const;

/**
 * Toolbar prop definitions.
 *
 * `size` is one value for the whole row (not responsive): the row hands it to every control
 * inside it that does not state its own, through context, so it has to be a single index.
 */
const toolbarRootPropDefs = {
  /**
   * Size step of the row and of every control in it that doesn't set its own `size`.
   * Matches Button's sizes: 1 (28px) to 4 (48px). Unset inside a Shell, it rests one step above
   * the Shell's `size`, except in a pane's `Shell.Scroll` list and in a Popover, Dialog, Sheet or
   * menu. Elsewhere it takes Theme size, else 2.
   */
  size: { type: 'enum', className: 'kui-r-size', values: sizes, default: '2' },
  /**
   * Direction of the row and of the arrow keys. Use `vertical` for a strip of tools along an edge.
   */
  orientation: { type: 'enum', values: orientations, default: 'horizontal' },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  orientation: PropDef<(typeof orientations)[number]>;
};

export { toolbarRootPropDefs };
