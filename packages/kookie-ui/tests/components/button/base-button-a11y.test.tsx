import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen } from '../../test-utils';
import { Button, Kbd, Text, Toggle } from '../../../src/components/index';

const Svg = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 12h16" />
  </svg>
);

describe('a disabled link-button', () => {
  it('as="a" is aria-disabled, keeps its href and does not navigate or call onClick', () => {
    const onClick = vi.fn();
    renderWithProviders(
      <Button as="a" href="/x" disabled onClick={onClick}>
        Go
      </Button>,
    );
    const link = screen.getByText('Go').closest('a')!;
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('href', '/x');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild with an anchor is aria-disabled and does not navigate', () => {
    renderWithProviders(
      <Button asChild disabled>
        <a href="/x">Go</a>
      </Button>,
    );
    const link = screen.getByText('Go').closest('a')!;
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(fireEvent.click(link)).toBe(false);
  });

  it('asChild disabled does not run the child onClick or stamp disabled on an anchor', () => {
    const onClick = vi.fn();
    renderWithProviders(
      <Button asChild disabled>
        <a href="/x" onClick={onClick}>
          Go
        </a>
      </Button>,
    );
    const link = screen.getByText('Go').closest('a')!;
    expect(link).not.toHaveAttribute('disabled');
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild disabled with a button child keeps native disabled', () => {
    renderWithProviders(
      <Button asChild disabled>
        <button type="button">Go</button>
      </Button>,
    );
    expect(screen.getByText('Go')).toBeDisabled();
  });

  it('an enabled link-button calls onClick and is not aria-disabled', () => {
    // jsdom cannot navigate; the handler stops it so only the call is checked.
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    renderWithProviders(
      <Button as="a" href="/x" onClick={onClick}>
        Go
      </Button>,
    );
    const link = screen.getByText('Go').closest('a')!;
    expect(link).not.toHaveAttribute('aria-disabled');
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('loading keeps the accessible name', () => {
  it('an iconOnly Button keeps its aria-label and is aria-busy', () => {
    renderWithProviders(
      <Button iconOnly aria-label="Save" loading>
        <Svg />
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('aria-label', 'Save');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(document.body.textContent).not.toContain('button is loading');
  });

  it('an iconOnly Toggle keeps its aria-label', () => {
    renderWithProviders(
      <Toggle iconOnly aria-label="Bold" loading>
        <Svg />
      </Toggle>,
    );
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-busy', 'true');
  });

  it('keeps the caller aria-describedby beside the loading description', () => {
    renderWithProviders(
      <>
        <span id="hint">Saves the draft</span>
        <Button loading aria-describedby="hint">
          Save
        </Button>
      </>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('aria-describedby')!.split(' ')).toContain('hint');
    expect(button).toHaveAccessibleDescription(/Saves the draft.*Loading/);
  });
});

describe('icon edges', () => {
  const edges = (el: Element) => [el.hasAttribute('data-icon-start'), el.hasAttribute('data-icon-end')];

  it('wrapped text is not an icon edge', () => {
    renderWithProviders(
      <>
        <Button radius="full">
          <Text>Wrapped</Text>
        </Button>
        <Button radius="full">
          Shortcut <Kbd>S</Kbd>
        </Button>
      </>,
    );
    expect(edges(screen.getByRole('button', { name: 'Wrapped' }))).toEqual([false, false]);
    expect(edges(screen.getByRole('button', { name: /Shortcut/ }))).toEqual([false, false]);
  });

  it('an svg, inline or from an icon component, is an icon edge', () => {
    renderWithProviders(
      <>
        <Button>
          <svg viewBox="0 0 24 24" />
          Inline
        </Button>
        <Button>
          Component
          <Svg />
        </Button>
      </>,
    );
    expect(edges(screen.getByRole('button', { name: 'Inline' }))).toEqual([true, false]);
    expect(edges(screen.getByRole('button', { name: 'Component' }))).toEqual([false, true]);
  });
});

describe('icon edges on the server', () => {
  it('an icon component at an edge counts as an icon before mount', () => {
    const html = renderToString(
      <Button radius="full">
        <Svg />
        Save
      </Button>,
    );
    expect(html).toContain('data-icon-start');
    expect(html).not.toContain('data-icon-end');
  });

  it('a text component at an edge does not', () => {
    const html = renderToString(
      <Button radius="full">
        Shortcut <Kbd>S</Kbd>
      </Button>,
    );
    expect(html).not.toContain('data-icon-end');
  });
});

describe('tooltip description', () => {
  it('joins the caller aria-describedby instead of replacing it', () => {
    renderWithProviders(
      <>
        <span id="hint">Saves the draft</span>
        <Button tooltip="Tip" aria-describedby="hint">
          Save
        </Button>
      </>,
    );
    const ids = screen.getByRole('button', { name: 'Save' }).getAttribute('aria-describedby')!.split(' ');
    expect(ids).toContain('hint');
    expect(ids).toHaveLength(2);
  });
});

describe('loading keeps the children in place', () => {
  it('wraps the content only for a button that takes loading', () => {
    const { container } = renderWithProviders(
      <>
        <Button>Plain</Button>
        <Button loading={false}>Loads</Button>
      </>,
    );
    const [plain, loads] = Array.from(container.querySelectorAll('button'));
    expect(plain.querySelector('.kui-BaseButtonContent')).toBeNull();
    expect(loads.querySelector('.kui-BaseButtonContent')).not.toBeNull();
  });

  it('child state survives starting and stopping loading', () => {
    let mounts = 0;
    const Counter = () => {
      React.useEffect(() => {
        mounts += 1;
      }, []);
      return <span>Label</span>;
    };
    const { rerender } = renderWithProviders(
      <Button loading={false}>
        <Counter />
      </Button>,
    );
    rerender(
      <Button loading>
        <Counter />
      </Button>,
    );
    rerender(
      <Button loading={false}>
        <Counter />
      </Button>,
    );
    // One mount for the visible label, one for the screen-reader copy while loading.
    expect(mounts).toBe(2);
  });
});
