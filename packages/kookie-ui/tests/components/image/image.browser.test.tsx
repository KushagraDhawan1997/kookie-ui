import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Image, Theme } from '../../../src/components/index';

// A 2x1 red PNG, so a load really happens in the browser.
const PIXELS =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR4nGP8z8DwnwEIGGEMAD8FA/9ZbzJ7AAAAAElFTkSuQmCC';

const transparent = (color: string) => color === 'rgba(0, 0, 0, 0)' || color === 'transparent';

describe('Image in the browser', () => {
  it('rests on a neutral fill until loaded, then clears it', async () => {
    render(
      <Theme>
        <Image src={PIXELS} alt="red" loading="eager" width="40px" height="20px" />
      </Theme>,
    );
    const img = document.querySelector<HTMLImageElement>('.kui-Image')!;
    await waitFor(() => expect(img.dataset.status).toBe('loaded'));
    expect(transparent(getComputedStyle(img).backgroundColor)).toBe(true);
  });

  it('keeps the fill when the image fails', async () => {
    render(
      <Theme>
        <Image src="data:image/png;base64,broken" alt="broken" loading="eager" width="40px" height="20px" />
      </Theme>,
    );
    const img = document.querySelector<HTMLImageElement>('.kui-Image')!;
    await waitFor(() => expect(img.dataset.status).toBe('error'));
    expect(transparent(getComputedStyle(img).backgroundColor)).toBe(false);
  });

  it('sizes the img itself and applies fit and the theme corner', async () => {
    render(
      <Theme radius="medium">
        <Image src={PIXELS} alt="red" loading="eager" width="80px" height="40px" fit="contain" />
      </Theme>,
    );
    const img = document.querySelector<HTMLImageElement>('.kui-Image')!;
    const box = img.getBoundingClientRect();
    expect(Math.round(box.width)).toBe(80);
    expect(Math.round(box.height)).toBe(40);
    expect(getComputedStyle(img).objectFit).toBe('contain');
    expect(parseFloat(getComputedStyle(img).borderTopLeftRadius)).toBeGreaterThan(0);
  });

  it('radius="none" squares the corner', () => {
    render(
      <Theme>
        <Image src={PIXELS} alt="red" radius="none" width="40px" height="20px" />
      </Theme>,
    );
    const img = document.querySelector<HTMLImageElement>('.kui-Image')!;
    expect(parseFloat(getComputedStyle(img).borderTopLeftRadius)).toBe(0);
  });
});
