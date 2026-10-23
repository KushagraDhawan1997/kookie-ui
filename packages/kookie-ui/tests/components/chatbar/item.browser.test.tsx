import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Chatbar, Theme } from '../../../src/components/index';

const rect = (el: Element | null) => el!.getBoundingClientRect();

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function Bar({ size = '2', children, attachments = [] }: { size?: '1' | '2' | '3'; children?: React.ReactNode; attachments?: Chatbar.ChatbarAttachment[] }) {
  return (
    <Theme>
      <div style={{ width: 420 }}>
        <Chatbar.Root size={size} open defaultAttachments={attachments}>
          <Chatbar.AttachmentsRow>{children}</Chatbar.AttachmentsRow>
          <Chatbar.Textarea aria-label="Message" />
        </Chatbar.Root>
      </div>
    </Theme>
  );
}

const file = (name: string, type: string, url?: string): Chatbar.ChatbarAttachment => ({
  id: name,
  name,
  size: 2048,
  type,
  url,
  file: new File(['x'], name, { type }),
});

describe('Chatbar.Item in a browser', () => {
  it('shows the row for items alone, and draws them as a pill with a lead, label and ×', () => {
    render(
      <Bar>
        <Chatbar.Item icon={<span>@</span>} color="purple" onRemove={() => {}}>
          Base plate
        </Chatbar.Item>
      </Bar>,
    );
    expect(screen.getByRole('list', { name: 'Attachments' })).toBeTruthy();
    const pill = document.querySelector('.kui-ChatbarItem')!;
    const lead = rect(pill.querySelector('.kui-ChatbarItemLead'));
    const remove = rect(pill.querySelector('.kui-ChatbarItemRemove'));
    const label = rect(pill.querySelector('.kui-ChatbarItemLabel'));
    expect(lead.right).toBeLessThanOrEqual(label.left + 0.5);
    expect(label.right).toBeLessThanOrEqual(remove.left + 0.5);
    // The lead is square and sits inside the pill.
    expect(Math.abs(lead.width - lead.height)).toBeLessThan(0.5);
    expect(lead.top).toBeGreaterThanOrEqual(rect(pill).top);
    expect(getComputedStyle(pill).borderTopWidth).toBe('1px');
  });

  it('calls onRemove, names the button after the label, and moves focus to the next pill', async () => {
    const onRemove = vi.fn();
    function Two() {
      const [items, setItems] = React.useState(['Base plate', 'Lid']);
      return (
        <Bar>
          {items.map((label) => (
            <Chatbar.Item
              key={label}
              onRemove={() => {
                onRemove(label);
                setItems((all) => all.filter((x) => x !== label));
              }}
            >
              {label}
            </Chatbar.Item>
          ))}
        </Bar>
      );
    }
    render(<Two />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove Base plate' }));
    expect(onRemove).toHaveBeenCalledWith('Base plate');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove Lid' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Lid' }));
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Message' }));
  });

  it('has no × without onRemove', () => {
    render(
      <Bar>
        <Chatbar.Item>Selection</Chatbar.Item>
      </Bar>,
    );
    expect(document.querySelector('.kui-ChatbarItemRemove')).toBeNull();
  });

  it('grows its lead with the bar size', () => {
    const { unmount } = render(
      <Bar size="1">
        <Chatbar.Item>Small</Chatbar.Item>
      </Bar>,
    );
    const small = rect(document.querySelector('.kui-ChatbarItemLead')).height;
    unmount();
    render(
      <Bar size="3">
        <Chatbar.Item>Large</Chatbar.Item>
      </Bar>,
    );
    expect(rect(document.querySelector('.kui-ChatbarItemLead')).height).toBeGreaterThan(small);
  });

  it('truncates a long label inside its maximum width', () => {
    render(
      <Bar>
        <Chatbar.Item onRemove={() => {}}>a-very-long-reference-name-that-would-never-fit-in-one-pill.step</Chatbar.Item>
      </Bar>,
    );
    const pill = rect(document.querySelector('.kui-ChatbarItem'));
    const remove = rect(document.querySelector('.kui-ChatbarItemRemove'));
    expect(pill.width).toBeLessThanOrEqual(240.5);
    expect(remove.right).toBeLessThanOrEqual(pill.right + 0.5);
  });
});

describe('Chatbar.Attachment as a pill', () => {
  it('draws an image and a file the same way an item is drawn, after which items follow', () => {
    render(
      <Bar attachments={[file('stand-ref.png', 'image/png', PNG), file('notes.pdf', 'application/pdf')]}>
        <Chatbar.Item>Base plate</Chatbar.Item>
      </Bar>,
    );
    const pills = Array.from(document.querySelectorAll('.kui-ChatbarItem'));
    expect(pills.map((p) => p.querySelector('.kui-ChatbarItemLabel')!.textContent)).toEqual([
      'stand-ref.png, 2 KB',
      'notes.pdf, 2 KB',
      'Base plate',
    ]);
    expect(pills[0]!.querySelector('img')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove stand-ref.png' })).toBeTruthy();
    const heights = pills.map((p) => Math.round(rect(p).height));
    expect(new Set(heights).size).toBe(1);
  });

  it('removes an attachment and keeps focus in the bar', async () => {
    render(<Bar attachments={[file('a.png', 'image/png', PNG), file('b.png', 'image/png', PNG)]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove a.png' }));
    expect(screen.queryByRole('button', { name: 'Remove a.png' })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove b.png' }));
  });
});
