import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen } from '../../test-utils';
import { Accordion } from '../../../src/components/index';

function Faq({ type, onKeyDown }: { type: 'single' | 'multiple'; onKeyDown?: React.KeyboardEventHandler }) {
  return (
    <Accordion.Root type={type} onKeyDown={onKeyDown}>
      {['A', 'B', 'C'].map((v) => (
        <Accordion.Item key={v} value={v}>
          <Accordion.Header>
            <Accordion.Trigger>{v}</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>{v} body</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

describe('Accordion keyboard', () => {
  for (const type of ['single', 'multiple'] as const) {
    it(`End and Home move focus in type="${type}"`, () => {
      renderWithProviders(<Faq type={type} />);
      const a = screen.getByRole('button', { name: 'A' });
      a.focus();
      fireEvent.keyDown(a, { key: 'End' });
      expect(screen.getByRole('button', { name: 'C' })).toHaveFocus();
      fireEvent.keyDown(document.activeElement!, { key: 'Home' });
      expect(a).toHaveFocus();
    });
  }

  it("calls the caller's onKeyDown", () => {
    const onKeyDown = vi.fn();
    renderWithProviders(<Faq type="multiple" onKeyDown={onKeyDown} />);
    const a = screen.getByRole('button', { name: 'A' });
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});
