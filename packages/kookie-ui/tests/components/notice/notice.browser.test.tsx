import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Button, Chatbar, Confirmation, Notice, Theme } from '../../../src/components/index';

const rect = (el: Element | null) => el!.getBoundingClientRect();

describe('Notice in a browser', () => {
  it('takes layout space and never floats', () => {
    render(
      <Theme>
        <div style={{ width: 400 }}>
          <Notice>Approaching your usage limit</Notice>
          <div data-testid="after">after</div>
        </div>
      </Theme>,
    );
    const notice = document.querySelector('.kui-NoticeRoot')!;
    const style = getComputedStyle(notice);
    expect(style.position).toBe('static');
    expect(style.zIndex).toBe('auto');
    expect(rect(document.querySelector('[data-testid="after"]')).top).toBeGreaterThanOrEqual(rect(notice).bottom - 0.5);
  });

  it('keeps its action and dismiss button inside a narrow strip, whatever the words', () => {
    render(
      <Theme>
        <div style={{ width: 280 }}>
          <Notice action={<Button size="2">Fix</Button>} onDismiss={() => {}}>
            cannot-reach-storage_eu_west_1_replica_seven.internal.example.test
          </Notice>
        </div>
      </Theme>,
    );
    const strip = rect(document.querySelector('.kui-NoticeRoot'));
    const dismiss = rect(document.querySelector('.kui-NoticeDismiss'));
    expect(strip.width).toBeLessThanOrEqual(280.5);
    expect(dismiss.right).toBeLessThanOrEqual(strip.right + 0.5);
  });

  it('grows its text and padding with size', () => {
    render(
      <Theme>
        <Notice size="1">Small</Notice>
        <Notice size="3">Large</Notice>
      </Theme>,
    );
    const [small, large] = Array.from(document.querySelectorAll('.kui-NoticeRoot'));
    const font = (el: Element) => parseFloat(getComputedStyle(el.querySelector('.kui-NoticeText')!).fontSize);
    expect(font(large!)).toBeGreaterThan(font(small!));
    expect(rect(large!).height).toBeGreaterThan(rect(small!).height);
  });

  it('puts a question’s answers under its words when the strip is narrow', () => {
    render(
      <Theme>
        <div style={{ width: 320 }}>
          <Confirmation confirmLabel="Allow up to $18" cancelLabel="Allow supports" onConfirm={() => {}} onCancel={() => {}}>
            $15 and no supports can’t both pass.
          </Confirmation>
        </div>
      </Theme>,
    );
    const words = rect(document.querySelector('.kui-NoticeText'));
    const answers = rect(document.querySelector('.kui-NoticeActions'));
    expect(answers.top).toBeGreaterThanOrEqual(words.bottom - 0.5);
    expect(answers.right).toBeLessThanOrEqual(320.5);
  });
});

describe('Chatbar notices and context in a browser', () => {
  function Fixture() {
    const [value, setValue] = React.useState('');
    return (
      <Theme>
        <div style={{ width: 480 }}>
          <Chatbar.Root
            value={value}
            onValueChange={setValue}
            notices={<Notice action={<Button>Open</Button>}>This chat last worked in Desk set</Notice>}
            context="Standard · 640 of 2,000 credits"
          >
            <Chatbar.Textarea aria-label="Message" />
            <Chatbar.Row>
              <Chatbar.Send />
            </Chatbar.Row>
          </Chatbar.Root>
        </div>
      </Theme>
    );
  }

  it('stacks notices above the box and the context below it', () => {
    render(<Fixture />);
    const notice = rect(document.querySelector('.kui-NoticeRoot'));
    const box = rect(document.querySelector('.kui-ChatbarBox'));
    const context = rect(document.querySelector('.kui-ChatbarContext'));
    expect(notice.bottom).toBeLessThanOrEqual(box.top + 0.5);
    expect(context.top).toBeGreaterThanOrEqual(box.bottom - 0.5);
  });

  it('keeps the chatbar open when a notice’s button is pressed', async () => {
    render(<Fixture />);
    const root = document.querySelector('.kui-ChatbarRoot')!;
    await userEvent.click(document.querySelector('textarea')!);
    expect(root.getAttribute('data-state')).toBe('open');
    await userEvent.click(document.querySelector('.kui-NoticeRoot button')!);
    expect(root.getAttribute('data-state')).toBe('open');
  });

  it('lets a root with a height fill it with the box', () => {
    render(
      <Theme>
        <Chatbar.Root style={{ height: 300, width: 400 }} notices={<Notice>Note</Notice>} context="ctx">
          <Chatbar.Textarea aria-label="Message" />
        </Chatbar.Root>
      </Theme>,
    );
    const root = rect(document.querySelector('.kui-ChatbarRoot'));
    const context = rect(document.querySelector('.kui-ChatbarContext'));
    expect(context.bottom).toBeLessThanOrEqual(root.bottom + 0.5);
  });
});
