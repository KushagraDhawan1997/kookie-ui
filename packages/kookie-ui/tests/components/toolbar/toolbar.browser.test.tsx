import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import {
  Button,
  Separator,
  Theme,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
} from '../../../src/components/index';

const rect = (el: Element) => el.getBoundingClientRect();
const isTransparent = (color: string) => color === 'transparent' || /\/\s*0\)$|,\s*0\)$/.test(color);

function Glyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden width="16" height="16">
      <circle cx="8" cy="8" r="4" fill="currentColor" />
    </svg>
  );
}

function Row(props: Partial<React.ComponentProps<typeof Toolbar>>) {
  return (
    <Theme>
      <button type="button">before</button>
      <Toolbar aria-label="Formatting" {...props}>
        <ToolbarButton>Bold</ToolbarButton>
        <ToolbarButton>Italic</ToolbarButton>
        <ToolbarButton>Underline</ToolbarButton>
      </Toolbar>
      <button type="button">after</button>
    </Theme>
  );
}

describe('Toolbar announces itself', () => {
  it('is role="toolbar", named by its aria-label, with its orientation', () => {
    render(<Row />);
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(toolbar.getAttribute('aria-orientation')).toBe('horizontal');
    expect(toolbar.classList.contains('kui-Toolbar')).toBe(true);
  });

  it('a toolbar button is a real <button>, with no extra role on top of it', () => {
    render(<Row />);
    const bold = screen.getByRole('button', { name: 'Bold' });
    expect(bold.tagName).toBe('BUTTON');
    expect(bold.getAttribute('role')).toBeNull();
    expect(bold.classList.contains('kui-Button')).toBe(true);
  });

  it('outside a Toolbar it renders a plain button with the toolbar rest look, and does not throw', () => {
    render(
      <Theme>
        <ToolbarButton>Loose</ToolbarButton>
        <Button variant="soft" color="gray">
          Twin
        </Button>
      </Theme>,
    );
    const loose = screen.getByRole('button', { name: 'Loose' });
    expect(loose.tagName).toBe('BUTTON');
    expect(getComputedStyle(loose).backgroundColor).toBe(
      getComputedStyle(screen.getByRole('button', { name: 'Twin' })).backgroundColor,
    );
  });
});

describe('Toolbar keyboard', () => {
  it('is ONE tab stop: Tab enters on the first control and the next Tab leaves the row', async () => {
    render(<Row />);
    screen.getByRole('button', { name: 'before' }).focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Bold' }));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
  });

  it('arrow keys move focus between the controls, and wrap at the ends', async () => {
    render(<Row />);
    screen.getByRole('button', { name: 'Bold' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Italic' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Underline' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Bold' }));
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Underline' }));
  });

  it('remembers the last focused control as the row’s tab stop', async () => {
    render(<Row />);
    screen.getByRole('button', { name: 'Bold' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Italic' }));
  });

  it('skips a disabled control', async () => {
    render(
      <Theme>
        <Toolbar aria-label="Edit">
          <ToolbarButton>Cut</ToolbarButton>
          <ToolbarButton disabled>Copy</ToolbarButton>
          <ToolbarButton>Paste</ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    screen.getByRole('button', { name: 'Cut' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Paste' }));
  });
});

describe('Toolbar orientation', () => {
  it('vertical: says so, stacks its controls, and walks them with Up/Down (not Left/Right)', async () => {
    render(<Row orientation="vertical" />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.getAttribute('aria-orientation')).toBe('vertical');
    expect(getComputedStyle(toolbar).flexDirection).toBe('column');

    const bold = screen.getByRole('button', { name: 'Bold' });
    const italic = screen.getByRole('button', { name: 'Italic' });
    expect(rect(italic).top).toBeGreaterThanOrEqual(rect(bold).bottom - 0.5);

    bold.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(bold);
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(italic);
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(bold);
  });

  it('horizontal: lays its controls out in a row and ignores Up/Down', async () => {
    render(<Row />);
    const toolbar = screen.getByRole('toolbar');
    expect(getComputedStyle(toolbar).flexDirection).toBe('row');
    const bold = screen.getByRole('button', { name: 'Bold' });
    bold.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(bold);
  });
});

describe('ToolbarButton', () => {
  it('icon-only: renders an icon-only Button named by its aria-label, square like one', () => {
    render(
      <Theme>
        <Toolbar aria-label="Formatting">
          <ToolbarButton iconOnly aria-label="Bold">
            <Glyph />
          </ToolbarButton>
        </Toolbar>
        <Button iconOnly aria-label="Twin" variant="soft" color="gray">
          <Glyph />
        </Button>
      </Theme>,
    );
    const bold = screen.getByRole('button', { name: 'Bold' });
    const twin = screen.getByRole('button', { name: 'Twin' });
    expect(bold.hasAttribute('data-icon-only')).toBe(true);
    expect(rect(bold).width).toBeCloseTo(rect(bold).height, 1);
    expect(rect(bold).width).toBeCloseTo(rect(twin).width, 1);
  });

  it('aria-pressed: announces the state and wears the pressed look', () => {
    render(
      <Theme>
        <Toolbar aria-label="Formatting">
          <ToolbarButton iconOnly aria-label="Bold" aria-pressed>
            <Glyph />
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Italic" aria-pressed={false}>
            <Glyph />
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Strike">
            <Glyph />
          </ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    const on = screen.getByRole('button', { name: 'Bold', pressed: true });
    const off = screen.getByRole('button', { name: 'Italic', pressed: false });
    const plain = screen.getByRole('button', { name: 'Strike' });
    expect(on.getAttribute('data-state')).toBe('on');
    expect(off.getAttribute('data-state')).toBe('off');
    expect(plain.hasAttribute('aria-pressed')).toBe(false);
    expect(plain.hasAttribute('data-state')).toBe(false);
    expect(getComputedStyle(on).backgroundColor).not.toBe(getComputedStyle(off).backgroundColor);
    expect(getComputedStyle(off).backgroundColor).toBe(getComputedStyle(plain).backgroundColor);
  });

  it('an unstated ToolbarButton paints what a gray soft Button paints', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row">
          <ToolbarButton>Share</ToolbarButton>
        </Toolbar>
        <Button variant="soft" color="gray">
          Twin
        </Button>
      </Theme>,
    );
    const share = screen.getByRole('button', { name: 'Share' });
    const twin = screen.getByRole('button', { name: 'Twin' });
    expect(getComputedStyle(share).backgroundColor).toBe(getComputedStyle(twin).backgroundColor);
    expect(getComputedStyle(share).color).toBe(getComputedStyle(twin).color);
  });

  it('a stated variant wins over the toolbar’s rest, and takes Button’s own colour for it', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row">
          <ToolbarButton variant="solid">Publish</ToolbarButton>
        </Toolbar>
        <Button variant="solid">Twin</Button>
      </Theme>,
    );
    const publish = screen.getByRole('button', { name: 'Publish' });
    expect(getComputedStyle(publish).backgroundColor).toBe(
      getComputedStyle(screen.getByRole('button', { name: 'Twin' })).backgroundColor,
    );
  });

  it('a stated color wins too', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row">
          <ToolbarButton color="red">Delete</ToolbarButton>
        </Toolbar>
        <Button variant="soft" color="red">
          Twin
        </Button>
      </Theme>,
    );
    expect(getComputedStyle(screen.getByRole('button', { name: 'Delete' })).color).toBe(
      getComputedStyle(screen.getByRole('button', { name: 'Twin' })).color,
    );
  });
});

describe('Toolbar size', () => {
  for (const size of ['1', '2', '3', '4'] as const) {
    it(`size ${size}: the row and its controls stand as tall as a Button at size ${size}`, () => {
      render(
        <Theme>
          <Toolbar aria-label="Row" size={size}>
            <ToolbarButton>Inside</ToolbarButton>
          </Toolbar>
          <Button size={size}>Twin</Button>
        </Theme>,
      );
      const twin = rect(screen.getByRole('button', { name: 'Twin' })).height;
      expect(rect(screen.getByRole('button', { name: 'Inside' })).height).toBeCloseTo(twin, 1);
      expect(rect(screen.getByRole('toolbar')).height).toBeCloseTo(twin, 1);
    });
  }

  it('the sizes are real steps, not an agreement between equal boxes', () => {
    render(
      <Theme>
        <Toolbar aria-label="Small" size="1">
          <ToolbarButton>Small</ToolbarButton>
        </Toolbar>
        <Toolbar aria-label="Large" size="4">
          <ToolbarButton>Large</ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    expect(rect(screen.getByRole('button', { name: 'Large' })).height).toBeGreaterThan(
      rect(screen.getByRole('button', { name: 'Small' })).height + 8,
    );
  });

  it('an explicit size on a control still wins', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row" size="1">
          <ToolbarButton size="3">Big</ToolbarButton>
        </Toolbar>
        <Button size="3">Twin</Button>
      </Theme>,
    );
    expect(rect(screen.getByRole('button', { name: 'Big' })).height).toBeCloseTo(
      rect(screen.getByRole('button', { name: 'Twin' })).height,
      1,
    );
  });
});

describe('ToolbarGroup', () => {
  it('is a named group that stands level with the button beside it, and hosts its own inside', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row" size="2">
          <ToolbarGroup aria-label="Text style">
            <ToolbarButton iconOnly aria-label="Bold">
              <Glyph />
            </ToolbarButton>
            <ToolbarButton iconOnly aria-label="Italic">
              <Glyph />
            </ToolbarButton>
          </ToolbarGroup>
          <ToolbarButton>Share</ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    const group = screen.getByRole('group', { name: 'Text style' });
    const share = screen.getByRole('button', { name: 'Share' });
    const bold = screen.getByRole('button', { name: 'Bold' });
    expect(rect(group).height).toBeCloseTo(rect(share).height, 1);
    expect(rect(bold).height).toBeLessThan(rect(group).height);
    expect(rect(bold).top).toBeGreaterThan(rect(group).top);
    expect(rect(bold).bottom).toBeLessThan(rect(group).bottom);
    expect(isTransparent(getComputedStyle(group).backgroundColor)).toBe(false);
  });

  it('its controls rest quiet (ghost): no fill of their own on the well', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row">
          <ToolbarGroup>
            <ToolbarButton>Hosted</ToolbarButton>
          </ToolbarGroup>
        </Toolbar>
      </Theme>,
    );
    expect(isTransparent(getComputedStyle(screen.getByRole('button', { name: 'Hosted' })).backgroundColor)).toBe(true);
  });

  it('arrow keys walk through a group as part of the same row', async () => {
    render(
      <Theme>
        <Toolbar aria-label="Row">
          <ToolbarGroup>
            <ToolbarButton>One</ToolbarButton>
            <ToolbarButton>Two</ToolbarButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarButton>Three</ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    screen.getByRole('button', { name: 'One' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Two' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Three' }));
  });

  it('disabled turns every control in it off, and the keyboard skips them', async () => {
    render(
      <Theme>
        <Toolbar aria-label="Row">
          <ToolbarButton>First</ToolbarButton>
          <ToolbarGroup disabled>
            <ToolbarButton>Off one</ToolbarButton>
            <ToolbarButton>Off two</ToolbarButton>
          </ToolbarGroup>
          <ToolbarButton>Last</ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    expect((screen.getByRole('button', { name: 'Off one' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Off two' }) as HTMLButtonElement).disabled).toBe(true);
    screen.getByRole('button', { name: 'First' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Last' }));
  });

  it('stacks its controls in a vertical toolbar', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row" orientation="vertical">
          <ToolbarGroup aria-label="Tools">
            <ToolbarButton iconOnly aria-label="Pen">
              <Glyph />
            </ToolbarButton>
            <ToolbarButton iconOnly aria-label="Eraser">
              <Glyph />
            </ToolbarButton>
          </ToolbarGroup>
        </Toolbar>
      </Theme>,
    );
    const pen = rect(screen.getByRole('button', { name: 'Pen' }));
    const eraser = rect(screen.getByRole('button', { name: 'Eraser' }));
    expect(eraser.top).toBeGreaterThanOrEqual(pen.bottom - 0.5);
    expect(eraser.left).toBeCloseTo(pen.left, 1);
  });
});

describe('ToolbarSeparator', () => {
  it('is a separator across the row’s direction, drawn in the gray a Separator draws', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row">
          <ToolbarButton>A</ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton>B</ToolbarButton>
        </Toolbar>
        <Separator data-testid="twin" />
      </Theme>,
    );
    const separator = screen.getByRole('toolbar').querySelector('.kui-ToolbarSeparator')!;
    expect(separator.getAttribute('role')).toBe('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
    const box = rect(separator);
    expect(box.width).toBeCloseTo(1, 1);
    expect(box.height).toBeGreaterThan(4);
    expect(box.height).toBeLessThan(rect(screen.getByRole('toolbar')).height);
    expect(getComputedStyle(separator).backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('twin')).backgroundColor,
    );
  });

  it('is horizontal in a vertical toolbar', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row" orientation="vertical">
          <ToolbarButton>A</ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton>B</ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    const separator = screen.getByRole('toolbar').querySelector('.kui-ToolbarSeparator')!;
    const box = rect(separator);
    expect(box.height).toBeCloseTo(1, 1);
    expect(box.width).toBeGreaterThan(4);
  });
});

describe('ToolbarTitle', () => {
  it('says its words, one step above a button label at the same size', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row" size="2">
          <ToolbarTitle>Notes</ToolbarTitle>
          <ToolbarButton>Share</ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    const title = screen.getByText('Notes');
    const share = screen.getByRole('button', { name: 'Share' });
    expect(parseFloat(getComputedStyle(title).fontSize)).toBeGreaterThan(parseFloat(getComputedStyle(share).fontSize));
  });

  it('renders nothing when it has no words', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row">
          <ToolbarTitle />
        </Toolbar>
      </Theme>,
    );
    expect(screen.getByRole('toolbar').querySelector('.kui-ToolbarTitle')).toBeNull();
  });

  it('truncates rather than wrapping, so the row stays one control row tall', () => {
    render(
      <Theme>
        <div style={{ width: 200 }}>
          <Toolbar aria-label="Row">
            <ToolbarTitle>A very long document title that cannot possibly fit in this narrow row</ToolbarTitle>
            <ToolbarButton>Share</ToolbarButton>
          </Toolbar>
        </div>
      </Theme>,
    );
    const toolbar = screen.getByRole('toolbar');
    const title = toolbar.querySelector('.kui-ToolbarTitle')!;
    expect(getComputedStyle(title).whiteSpace).toBe('nowrap');
    expect(rect(toolbar).width).toBeLessThanOrEqual(200.5);
    expect(rect(toolbar).height).toBeCloseTo(rect(screen.getByRole('button', { name: 'Share' })).height, 1);
  });

  it('takes more air from the control after it than two controls take from each other', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row" style={{ justifyContent: 'flex-start' }}>
          <ToolbarTitle>Notes</ToolbarTitle>
          <ToolbarButton>One</ToolbarButton>
          <ToolbarButton>Two</ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    const title = rect(screen.getByText('Notes'));
    const one = rect(screen.getByRole('button', { name: 'One' }));
    const two = rect(screen.getByRole('button', { name: 'Two' }));
    expect(one.left - title.right).toBeGreaterThan(two.left - one.right + 1);
    expect(title.left).toBeCloseTo(rect(screen.getByRole('toolbar')).left, 1);
  });
});
