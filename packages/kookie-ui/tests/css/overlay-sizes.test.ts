import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { dialogContentPropDefs } from '../../src/components/dialog.props.js';
import { alertDialogContentPropDefs } from '../../src/components/alert-dialog.props.js';

const COMPONENTS = path.join(__dirname, '../../src/components');
const read = (file: string) => fs.readFileSync(path.join(COMPONENTS, file), 'utf8');

describe('overlays follow the v2 overlay ladder', () => {
  it('rest at size 2 with no default max width', () => {
    for (const defs of [dialogContentPropDefs, alertDialogContentPropDefs]) {
      expect(defs.size.default).toBe('2');
      expect(defs.size.values).toEqual(['1', '2', '3', '4']);
      expect('default' in defs.maxWidth).toBe(false);
    }
  });

  it('size N pads one surface step up (capped at 4), wears overlay corner N and width N', () => {
    const css = read('_internal/base-dialog.css');
    const pad = ['2', '3', '4', '4'];
    for (let n = 1; n <= 4; n++) {
      const block = css.match(new RegExp(`kui-r-size-${n}\\) \\{([^}]*)\\}`))?.[1] ?? '';
      expect(block).toContain(`--dialog-content-padding: var(--surface-p-${pad[n - 1]})`);
      expect(block).toContain(`--overlay-w: var(--overlay-w-${n})`);
      expect(block).toContain(`border-radius: var(--radius-overlay-${n})`);
    }
    expect(css).not.toMatch(/--dialog-content-padding: var\(--space-/);
  });

  it('dialogs and alert dialogs cap at the overlay width; sheets only on start/end', () => {
    expect(read('dialog.css')).toContain('max-width: var(--overlay-w)');
    expect(read('alert-dialog.css')).toContain('max-width: var(--overlay-w)');
    const sheet = read('sheet.css');
    expect(sheet).toContain('max-width: min(var(--overlay-w), 100vw)');
    expect(sheet.match(/max-width: none/g)?.length).toBe(2);
  });
});
