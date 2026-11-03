import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Theme } from '@kushagradhawan/kookie-ui';

/**
 * Every file under app/docs/<slug>/examples/ renders inside a Theme with no thrown error and
 * nothing written to console.error or console.warn. A new example is covered by being a file.
 */
const examples = import.meta.glob<{ default: React.ComponentType }>('../app/docs/*/examples/*.tsx', { eager: true });

describe('docs examples', () => {
  let logged: unknown[][] = [];

  beforeEach(() => {
    logged = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => void logged.push(args));
    vi.spyOn(console, 'warn').mockImplementation((...args) => void logged.push(args));
  });

  afterEach(() => vi.restoreAllMocks());

  it('finds the example files', () => {
    expect(Object.keys(examples).length).toBeGreaterThan(0);
  });

  for (const [file, module] of Object.entries(examples)) {
    const name = file.replace('../app/docs/', '');

    it(`${name} renders`, () => {
      const Example = module.default;
      expect(typeof Example, `${name} needs a default-exported component`).toBe('function');
      const { container } = render(
        <Theme>
          <Example />
        </Theme>,
      );
      expect(container.innerHTML).not.toBe('');
      expect(logged, `${name} logged:\n${logged.map((args) => args.join(' ')).join('\n')}`).toEqual([]);
    });
  }
});
