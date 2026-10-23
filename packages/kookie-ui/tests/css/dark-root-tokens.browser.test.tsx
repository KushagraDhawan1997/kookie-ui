import { afterEach, describe, expect, it } from 'vitest';

// A next-themes setup: class="dark" on <html>, the Theme further down. CSS outside the Theme
// (a body background) still reads the page and surface tokens.
const resolve = (el: Element, token: string) => {
  const probe = document.createElement('span');
  probe.style.backgroundColor = `var(${token})`;
  el.appendChild(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
};

describe('a bare .dark root outside any Theme', () => {
  afterEach(() => document.documentElement.classList.remove('dark'));

  it.each([
    ['--color-page', '--gray-1'],
    ['--color-surface', '--gray-2'],
  ])('resolves %s to the dark gray step', (token, gray) => {
    document.documentElement.classList.add('dark');
    const value = resolve(document.body, token);
    expect(value).not.toBe('rgba(0, 0, 0, 0)');
    expect(value).toBe(resolve(document.body, gray));
  });
});
