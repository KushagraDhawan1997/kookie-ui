import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

const readVar = (el: HTMLElement, name: string) => Number.parseFloat(getComputedStyle(el).getPropertyValue(name));

describe('Resize regressions', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps the live size when an unrelated re-render happens (persistence loads once)', async () => {
    window.localStorage.setItem('kookie-ui:shell:panel:persist-1', '333');

    function App() {
      const [count, setCount] = React.useState(0);
      return (
        <Shell.Root>
          <Shell.Rail presentation="fixed" />
          {/* An inline onResize used to re-run the load effect on every render. */}
          <Shell.Panel defaultOpen resizable paneId="persist-1" expandedSize={200} minSize={100} maxSize={400} onResize={() => {}}>
            panel
            <Shell.Panel.Handle />
          </Shell.Panel>
          <Shell.Content>
            <button type="button" data-testid="rerender" onClick={() => setCount(count + 1)}>
              {count}
            </button>
          </Shell.Content>
        </Shell.Root>
      );
    }

    renderWithProviders(<App />);
    const handle = screen.getByRole('separator');
    const panel = handle.parentElement as HTMLElement;

    // The stored size is applied once, on mount.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(readVar(panel, '--panel-size')).toBe(333);

    // The user drags to a new size.
    fireEvent.keyDown(handle, { key: 'End' });
    fireEvent.keyUp(handle, { key: 'End' });
    expect(readVar(panel, '--panel-size')).toBe(400);

    // An unrelated render must not restore the persisted value.
    fireEvent.click(screen.getByTestId('rerender'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(readVar(panel, '--panel-size')).toBe(400);
  });

  it('moves the Bottom pane the same way for keys and for drags', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Bottom defaultOpen resizable expandedSize={200} minSize={100} maxSize={400}>
          bottom
          <Shell.Bottom.Handle />
        </Shell.Bottom>
      </Shell.Root>,
    );

    const handle = screen.getByRole('separator');
    const bottom = handle.parentElement as HTMLElement;
    expect(readVar(bottom, '--bottom-size')).toBe(200);

    // Dragging the top edge downwards shrinks the pane: the drag formula is `startSize - delta`.
    // jsdom has no PointerEvent, so a drag carries no coordinates here — the guard must leave the
    // size alone rather than writing NaN into the custom property.
    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 0 });
    fireEvent.pointerMove(window, { clientY: 40 });
    expect(readVar(bottom, '--bottom-size')).toBe(200);
    fireEvent.pointerUp(window);

    // ArrowDown has to agree with the drag direction, not invert it.
    const beforeKey = readVar(bottom, '--bottom-size');
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    fireEvent.keyUp(handle, { key: 'ArrowDown' });
    expect(readVar(bottom, '--bottom-size')).toBeLessThan(beforeKey);

    // ...and ArrowUp grows it again.
    const beforeUp = readVar(bottom, '--bottom-size');
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    fireEvent.keyUp(handle, { key: 'ArrowUp' });
    expect(readVar(bottom, '--bottom-size')).toBeGreaterThan(beforeUp);
  });

  it('registers exactly one move listener for a drag', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Rail presentation="fixed" />
        <Shell.Panel defaultOpen resizable expandedSize={200} minSize={100} maxSize={400}>
          panel
          <Shell.Panel.Handle />
        </Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );

    const handle = screen.getByRole('separator');
    const moveEvents = ['pointermove', 'mousemove'];
    const registered: string[] = [];
    const record = (target: string) => (type: string) => {
      if (moveEvents.includes(type)) registered.push(`${target}:${type}`);
    };

    const windowSpy = vi.spyOn(window, 'addEventListener').mockImplementation(record('window') as never);
    const documentSpy = vi.spyOn(document, 'addEventListener').mockImplementation(record('document') as never);
    const handleSpy = vi.spyOn(handle, 'addEventListener').mockImplementation(record('handle') as never);

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100 });

    windowSpy.mockRestore();
    documentSpy.mockRestore();
    handleSpy.mockRestore();

    // A move used to be handled by window, document and the handle itself, plus a mousemove pair.
    expect(registered).toEqual(['window:pointermove']);

    fireEvent.pointerUp(window);
  });

  it('reports the pane size through aria-valuenow', async () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Rail presentation="fixed" />
        <Shell.Panel defaultOpen resizable defaultSize={260} expandedSize={200} minSize={100} maxSize={400}>
          panel
          <Shell.Panel.Handle />
        </Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );

    const handle = screen.getByRole('separator');
    // defaultSize, not expandedSize.
    expect(handle).toHaveAttribute('aria-valuenow', '260');
    expect(handle).toHaveAttribute('aria-valuemin', '100');
    expect(handle).toHaveAttribute('aria-valuemax', '400');

    fireEvent.keyDown(handle, { key: 'End' });
    fireEvent.keyUp(handle, { key: 'End' });
    expect(handle).toHaveAttribute('aria-valuenow', '400');
  });
});
