import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

const q = (selector: string) => document.querySelector(selector) as HTMLElement;
const sizeOf = (selector: string, variable: string) => Number.parseFloat(q(selector).style.getPropertyValue(variable));

afterEach(() => {
  vi.restoreAllMocks();
});

/** Gives jsdom a layout: a box per element, keyed by class name. */
function mockBoxes(boxes: Record<string, { left: number; right: number; top?: number; bottom?: number }>) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const key = Object.keys(boxes).find((cls) => this.classList.contains(cls));
    const box = key ? boxes[key] : { left: 0, right: 0, top: 0, bottom: 0 };
    const top = box.top ?? 0;
    const bottom = box.bottom ?? 800;
    return { left: box.left, right: box.right, top, bottom, x: box.left, y: top, width: box.right - box.left, height: bottom - top, toJSON: () => ({}) } as DOMRect;
  });
}

describe('a resize stays inside the frame', () => {
  it('measures the room from where the pane starts, for the keys as well as the drag', () => {
    // A 700px frame, a 64px Rail, and a Panel that starts after it. The
    // Panel's own maxSize (800) would take its handle off the frame.
    mockBoxes({ 'kui-ShellRoot': { left: 0, right: 700 }, 'kui-ShellPanel': { left: 64, right: 264 }, 'kui-ShellResizer': { left: 258, right: 270 } });
    renderWithProviders(
      <Shell.Root>
        <Shell.Rail presentation="fixed" />
        <Shell.Panel defaultOpen resizable expandedSize={200} minSize={100} maxSize={800}>
          panel
        </Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    const handle = screen.getByRole('separator');

    fireEvent.keyDown(handle, { key: 'End' });
    // 700 - 64 of room, less the 12px the handle takes.
    expect(sizeOf('.kui-ShellPanel', '--panel-size')).toBe(624);

    fireEvent.focus(handle);
    expect(handle.getAttribute('aria-valuemax')).toBe('624');
  });
});

describe('the announced value follows the size', () => {
  it('starts at defaultSize', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector presentation="fixed" defaultOpen resizable defaultSize={400}>
          inspector
        </Shell.Inspector>
      </Shell.Root>,
    );
    expect(screen.getByRole('separator').getAttribute('aria-valuenow')).toBe('400');
  });

  it('follows a controlled size the app changes', () => {
    function App({ size }: { size: number }) {
      return (
        <Shell.Root>
          <Shell.Content>content</Shell.Content>
          <Shell.Inspector presentation="fixed" defaultOpen resizable size={size}>
            inspector
          </Shell.Inspector>
        </Shell.Root>
      );
    }
    const { rerender } = renderWithProviders(<App size={360} />);
    expect(screen.getByRole('separator').getAttribute('aria-valuenow')).toBe('360');
    rerender(<App size={450} />);
    expect(screen.getByRole('separator').getAttribute('aria-valuenow')).toBe('450');
  });
});

describe('a controlled size on an overlay', () => {
  it('is not squeezed by an app maximum below its minimum, and nothing squeezed is reported', () => {
    // jsdom's width is below every breakpoint, so the Inspector is an overlay.
    const onSizeChange = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen expandedSize={500} size={500} minSize={400} maxSize={187} onSizeChange={onSizeChange}>
          inspector
        </Shell.Inspector>
      </Shell.Root>,
    );
    expect(q('.kui-ShellInspector').getAttribute('data-presentation')).toBe('overlay');
    expect(sizeOf('.kui-ShellInspector', '--inspector-size')).toBe(500);
    expect(onSizeChange).not.toHaveBeenCalled();
  });

  it('in the frame, a minimum above the maximum wins', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector presentation="fixed" defaultOpen size={100} minSize={400} maxSize={300}>
          inspector
        </Shell.Inspector>
      </Shell.Root>,
    );
    expect(sizeOf('.kui-ShellInspector', '--inspector-size')).toBe(400);
  });
});

describe('expandedSize is the size only until something else sets one', () => {
  function App({ expandedSize }: { expandedSize: number }) {
    return (
      <Shell.Root>
        <Shell.Rail presentation="fixed" />
        <Shell.Panel defaultOpen resizable expandedSize={expandedSize} minSize={100} maxSize={400}>
          panel
        </Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>
    );
  }

  it('moves an untouched pane', () => {
    const { rerender } = renderWithProviders(<App expandedSize={200} />);
    expect(sizeOf('.kui-ShellPanel', '--panel-size')).toBe(200);
    rerender(<App expandedSize={210} />);
    expect(sizeOf('.kui-ShellPanel', '--panel-size')).toBe(210);
  });

  it('leaves a size the user dragged', () => {
    const { rerender } = renderWithProviders(<App expandedSize={200} />);
    const handle = screen.getByRole('separator');
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100 });
    fireEvent.pointerMove(window, { clientX: 150 });
    fireEvent.pointerUp(window);
    expect(sizeOf('.kui-ShellPanel', '--panel-size')).toBe(250);

    rerender(<App expandedSize={210} />);
    expect(sizeOf('.kui-ShellPanel', '--panel-size')).toBe(250);
  });
});

describe('a drag that collapses the pane', () => {
  it('still ends, at the size the pane had before it', () => {
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn();
    const onOpenChange = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Rail presentation="fixed" />
        <Shell.Panel defaultOpen resizable expandedSize={200} minSize={120} collapseThreshold={80} onResizeStart={onResizeStart} onResizeEnd={onResizeEnd} onOpenChange={onOpenChange}>
          panel
        </Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    const handle = screen.getByRole('separator');
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 200 });
    fireEvent.pointerMove(window, { clientX: 60 });
    fireEvent.pointerUp(window);

    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'toggle' });
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    expect(onResizeEnd).toHaveBeenLastCalledWith(200);
  });
});
