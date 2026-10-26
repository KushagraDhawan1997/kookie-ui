import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, renderWithProviders, screen, fireEvent } from '../../test-utils';
import { TextField } from '../../../src/components/index';

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

// A real press fires pointerdown, then mousedown.
function press(el: Element) {
  fireEvent.pointerDown(el);
  fireEvent.mouseDown(el);
}

describe('TextField root press', () => {
  it('leaves focus on a select inside a slot', async () => {
    renderWithProviders(
      <TextField.Root aria-label="Amount">
        <TextField.Slot side="right">
          <select aria-label="Unit">
            <option>px</option>
          </select>
        </TextField.Slot>
      </TextField.Root>,
    );
    const select = screen.getByRole('combobox', { name: 'Unit' });
    select.focus();
    press(select);
    await nextFrame();
    expect(document.activeElement).toBe(select);
  });

  it('leaves a label and a tabindex widget inside a slot alone', async () => {
    renderWithProviders(
      <TextField.Root aria-label="Amount">
        <TextField.Slot>
          <label htmlFor="other">Other</label>
          <span role="button" tabIndex={0} data-testid="widget">
            ?
          </span>
        </TextField.Slot>
      </TextField.Root>,
    );
    const widget = screen.getByTestId('widget');
    widget.focus();
    press(widget);
    press(screen.getByText('Other'));
    await nextFrame();
    expect(document.activeElement).toBe(widget);
  });

  it('focuses the input at once when a passive slot is pressed, and prevents the default', () => {
    renderWithProviders(
      <TextField.Root aria-label="Width" defaultValue="100">
        <TextField.Slot side="right">px</TextField.Slot>
      </TextField.Root>,
    );
    const input = screen.getByRole('textbox');
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    screen.getByText('px').dispatchEvent(event);
    expect(document.activeElement).toBe(input);
    expect(event.defaultPrevented).toBe(true);
    expect(input.selectionStart).toBe(3);
  });
});

describe('TextField.Slot pointer handlers', () => {
  it("runs the caller's pointer handlers on a slot without scrub", () => {
    const down = vi.fn();
    const move = vi.fn();
    const up = vi.fn();
    renderWithProviders(
      <TextField.Root aria-label="Width">
        <TextField.Slot data-testid="slot" onPointerDown={down} onPointerMove={move} onPointerUp={up}>
          W
        </TextField.Slot>
      </TextField.Root>,
    );
    const slot = screen.getByTestId('slot');
    fireEvent.pointerDown(slot);
    fireEvent.pointerMove(slot);
    fireEvent.pointerUp(slot);
    expect([down.mock.calls.length, move.mock.calls.length, up.mock.calls.length]).toEqual([1, 1, 1]);
  });

  it("runs the caller's pointer handlers on a scrub slot too", () => {
    const down = vi.fn();
    renderWithProviders(
      <TextField.Root aria-label="Width">
        <TextField.Slot data-testid="slot" scrub onPointerDown={down}>
          W
        </TextField.Slot>
      </TextField.Root>,
    );
    const slot = screen.getByTestId('slot');
    slot.requestPointerLock = vi.fn();
    fireEvent.pointerDown(slot);
    expect(down).toHaveBeenCalledTimes(1);
    expect(slot.requestPointerLock).toHaveBeenCalledTimes(1);
  });
});

// jsdom's user agent takes the pointer lock path.
function setPointerLockElement(el: Element | null) {
  Object.defineProperty(document, 'pointerLockElement', { configurable: true, get: () => el });
  document.dispatchEvent(new Event('pointerlockchange'));
}

function mouseMove(movementX: number, movementY: number) {
  const event = new MouseEvent('mousemove', { bubbles: true });
  Object.defineProperty(event, 'movementX', { value: movementX });
  Object.defineProperty(event, 'movementY', { value: movementY });
  document.dispatchEvent(event);
}

describe('TextField.Slot scrub pointer lock', () => {
  it('does not end a scrub it never started when the lock changes elsewhere', () => {
    const first = vi.fn();
    const second = vi.fn();
    renderWithProviders(
      <TextField.Root aria-label="Size">
        <TextField.Slot scrub onScrub={first}>
          X
        </TextField.Slot>
        <TextField.Slot scrub side="right" onScrub={second}>
          Y
        </TextField.Slot>
      </TextField.Root>,
    );
    act(() => setPointerLockElement(null));
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
    Object.defineProperty(document, 'pointerLockElement', { configurable: true, get: () => null });
  });

  it('moves the virtual cursor without re-rendering on every mouse move', () => {
    const onScrub = vi.fn();
    let commits = 0;
    renderWithProviders(
      <React.Profiler id="field" onRender={() => commits++}>
        <TextField.Root aria-label="Size">
          <TextField.Slot scrub scrubSensitivity={1000} onScrub={onScrub} data-testid="slot">
            X
          </TextField.Slot>
        </TextField.Root>
      </React.Profiler>,
    );
    const slot = screen.getByTestId('slot');
    slot.requestPointerLock = vi.fn(() => setPointerLockElement(slot));
    act(() => {
      fireEvent.pointerDown(slot, { clientX: 100, clientY: 50 });
    });
    expect(slot).toHaveAttribute('data-scrubbing');
    const cursor = document.querySelector<HTMLImageElement>('.kui-TextFieldSlotScrubCursor')!;
    expect(cursor.style.left).toBe('100px');

    const before = commits;
    act(() => {
      mouseMove(5, 2);
      mouseMove(5, 2);
      mouseMove(5, 2);
    });
    expect(commits).toBe(before);
    expect(cursor.style.left).toBe('115px');
    expect(cursor.style.top).toBe('56px');

    act(() => setPointerLockElement(null));
    expect(slot).not.toHaveAttribute('data-scrubbing');
    expect(onScrub).toHaveBeenLastCalledWith(0, false);
  });
});

describe('TextField.Slot description', () => {
  it("adds each slot to the input's aria-describedby, after the caller's ids", () => {
    renderWithProviders(
      <TextField.Root aria-label="Price" aria-describedby="hint">
        <TextField.Slot data-testid="lead">$</TextField.Slot>
        <TextField.Slot side="right" id="unit">
          USD
        </TextField.Slot>
      </TextField.Root>,
    );
    const lead = screen.getByTestId('lead');
    expect(lead.id).not.toBe('');
    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toBe(`hint ${lead.id} unit`);
  });

  it('leaves a slot that holds a control out of aria-describedby', () => {
    renderWithProviders(
      <TextField.Root aria-label="Password" type="password">
        <TextField.Slot side="right">
          <button type="button" aria-label="Show password" />
        </TextField.Slot>
        <TextField.Slot side="right" id="unit">
          kg
        </TextField.Slot>
      </TextField.Root>,
    );
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-describedby', 'unit');
  });

  it('drops a slot from aria-describedby when it unmounts', () => {
    const { rerender } = renderWithProviders(
      <TextField.Root aria-label="Price">
        <TextField.Slot id="unit">USD</TextField.Slot>
      </TextField.Root>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'unit');
    rerender(<TextField.Root aria-label="Price" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });
});

describe('TextField error message', () => {
  it('renders the message after the field box, not inside it', () => {
    const { container } = renderWithProviders(<TextField.Root aria-label="Name" error errorMessage="Name is required" />);
    const root = container.querySelector('.kui-TextFieldRoot')!;
    const message = screen.getByRole('alert');
    expect(root.contains(message)).toBe(false);
    expect(root.nextElementSibling).toBe(message);
    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toBe(message.id);
  });

  it('puts the field and message in one box that takes className and style', () => {
    const { container } = renderWithProviders(
      <div data-testid="parent">
        <TextField.Root aria-label="Name" size="3" className="app" style={{ width: 240 }} errorMessage="Name is required" />
      </div>,
    );
    const parent = screen.getByTestId('parent');
    expect(parent.children).toHaveLength(1);
    const wrapper = parent.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass('kui-TextFieldWrapper', 'app');
    expect(wrapper.style.width).toBe('240px');
    const root = container.querySelector<HTMLElement>('.kui-TextFieldRoot')!;
    expect(root.parentElement).toBe(wrapper);
    expect(root).toHaveClass('kui-r-size-3');
    expect(root).not.toHaveClass('app');
    expect(root.style.width).toBe('');
  });

  it('keeps className and style on the field without a message', () => {
    const { container } = renderWithProviders(<TextField.Root aria-label="Name" className="app" style={{ width: 240 }} />);
    const root = container.querySelector<HTMLElement>('.kui-TextFieldRoot')!;
    // The wrapper stays (laid out as `display: contents`) so a message never moves the field.
    const wrapper = container.querySelector<HTMLElement>('.kui-TextFieldWrapper')!;
    expect(wrapper.hasAttribute('data-message')).toBe(false);
    expect(wrapper).not.toHaveClass('app');
    expect(root).toHaveClass('app');
    expect(root.style.width).toBe('240px');
  });
});
