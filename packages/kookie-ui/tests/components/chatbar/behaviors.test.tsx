import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, fireEvent, act } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { Chatbar, IconButton } from '../../../src/components/index';

type RootProps = React.ComponentProps<typeof Chatbar.Root>;

function ChatbarFixture({ submitOnEnter, ...props }: RootProps & { submitOnEnter?: boolean }) {
  const [value, setValue] = React.useState('');
  return (
    <div>
      <Chatbar.Root {...props} value={value} onValueChange={setValue}>
        <Chatbar.AttachmentsRow />
        <Chatbar.Textarea aria-label="Message" submitOnEnter={submitOnEnter} />
        <Chatbar.Row>
          <Chatbar.AttachTrigger asChild>
            <IconButton aria-label="Attach" />
          </Chatbar.AttachTrigger>
          <Chatbar.Send>Send</Chatbar.Send>
        </Chatbar.Row>
      </Chatbar.Root>
      <button aria-label="outside" />
    </div>
  );
}

const pngFile = (name = 'image.png') => new File(['file-bytes'], name, { type: 'image/png' });

function pasteFiles(target: HTMLElement, files: File[], text?: string) {
  const items = [
    ...files.map((file) => ({ kind: 'file', type: file.type, getAsFile: () => file })),
    ...(text != null ? [{ kind: 'string', type: 'text/plain', getAsFile: () => null }] : []),
  ];
  const clipboardData = {
    items,
    files,
    types: [...(files.length ? ['Files'] : []), ...(text != null ? ['text/plain'] : [])],
    getData: (type: string) => (type === 'text/plain' ? (text ?? '') : ''),
  } as unknown as DataTransfer;
  return fireEvent.paste(target, { clipboardData });
}

const getTextarea = () => screen.getByLabelText('Message') as HTMLTextAreaElement;
const getRoot = () => getTextarea().closest('.rt-ChatbarRoot') as HTMLElement;

describe('Chatbar behaviors', () => {
  it('expands on focus when expandOn="focus" and collapses on blur when empty', async () => {
    renderWithProviders(<ChatbarFixture expandOn="focus" />);
    expect(getRoot()).toHaveAttribute('data-state', 'closed');
    await userEvent.click(getTextarea());
    expect(getRoot()).toHaveAttribute('data-state', 'open');
    await userEvent.click(screen.getByLabelText('outside'));
    expect(getRoot()).toHaveAttribute('data-state', 'closed');
  });

  it('does not collapse on blur when expandOn="none"', async () => {
    renderWithProviders(<ChatbarFixture expandOn="none" defaultOpen />);
    await userEvent.click(getTextarea());
    await userEvent.click(screen.getByLabelText('outside'));
    expect(getRoot()).toHaveAttribute('data-state', 'open');
  });

  describe('paste', () => {
    it('attaches a pasted file exactly once and suppresses filename text', async () => {
      renderWithProviders(<ChatbarFixture expandOn="focus" />);
      await userEvent.click(getTextarea());
      pasteFiles(getTextarea(), [pngFile()]);
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(getTextarea().value).toBe('');
    });

    it('does not attach when paste={false}', async () => {
      renderWithProviders(<ChatbarFixture paste={false} />);
      pasteFiles(getTextarea(), [pngFile()]);
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });

    it('lets default paste through when every pasted file is rejected', () => {
      const onAttachmentReject = vi.fn();
      renderWithProviders(<ChatbarFixture accept="application/pdf" onAttachmentReject={onAttachmentReject} />);
      const event = pasteFiles(getTextarea(), [pngFile()], 'hello');
      // fireEvent returns false when preventDefault was called
      expect(event).toBe(true);
      expect(onAttachmentReject).toHaveBeenCalledWith([expect.objectContaining({ reason: 'type' })]);
    });

    it('pasteAccept can widen accept', () => {
      renderWithProviders(<ChatbarFixture accept="application/pdf" pasteAccept="image/*" />);
      pasteFiles(getTextarea(), [pngFile()]);
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('multiple={false} keeps only the first pasted file', () => {
      const onAttachmentReject = vi.fn();
      renderWithProviders(<ChatbarFixture multiple={false} onAttachmentReject={onAttachmentReject} />);
      pasteFiles(getTextarea(), [pngFile('a.png'), pngFile('b.png')]);
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(onAttachmentReject).toHaveBeenCalledWith([expect.objectContaining({ reason: 'count' })]);
    });

    it('rejects by size and count', () => {
      const onAttachmentReject = vi.fn();
      renderWithProviders(<ChatbarFixture maxFileSize={4} maxAttachments={1} onAttachmentReject={onAttachmentReject} />);
      const small = new File(['ab'], 'small.png', { type: 'image/png' });
      pasteFiles(getTextarea(), [pngFile('big.png'), small, pngFile('c.png')]);
      const reasons = onAttachmentReject.mock.calls[0][0].map((r: { reason: string }) => r.reason);
      expect(reasons).toEqual(['size', 'count']);
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('ignores paste when readOnly or disabled', () => {
      const { rerender } = renderWithProviders(<ChatbarFixture readOnly />);
      pasteFiles(getTextarea(), [pngFile()]);
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
      rerender(<ChatbarFixture disabled />);
      pasteFiles(getTextarea(), [pngFile()]);
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });
  });

  describe('submit', () => {
    it('Send submits the payload and clears a controlled value', async () => {
      const onSubmit = vi.fn();
      renderWithProviders(<ChatbarFixture onSubmit={onSubmit} defaultOpen />);
      await userEvent.type(getTextarea(), 'hi');
      await userEvent.click(screen.getByRole('button', { name: 'Send' }));
      expect(onSubmit).toHaveBeenCalledWith({ value: 'hi', attachments: [] });
      expect(getTextarea().value).toBe('');
    });

    it('keeps focus in the textarea after Send clears', async () => {
      renderWithProviders(<ChatbarFixture onSubmit={vi.fn()} defaultOpen />);
      await userEvent.type(getTextarea(), 'hi');
      await userEvent.click(screen.getByRole('button', { name: 'Send' }));
      expect(getTextarea()).toHaveFocus();
    });

    it('clearOnSubmit={false} keeps the message when sending', async () => {
      renderWithProviders(<ChatbarFixture onSubmit={vi.fn()} clearOnSubmit={false} defaultOpen />);
      await userEvent.type(getTextarea(), 'hi');
      await userEvent.click(screen.getByRole('button', { name: 'Send' }));
      expect(getTextarea().value).toBe('hi');
    });

    it('Enter submits with sendMode="never" and Shift+Enter inserts a newline', async () => {
      const onSubmit = vi.fn();
      renderWithProviders(<ChatbarFixture onSubmit={onSubmit} sendMode="never" submitOnEnter />);
      await userEvent.type(getTextarea(), 'a{Shift>}{Enter}{/Shift}b');
      expect(getTextarea().value).toBe('a\nb');
      await userEvent.type(getTextarea(), '{Enter}');
      expect(onSubmit).toHaveBeenCalledWith({ value: 'a\nb', attachments: [] });
      expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
    });

    it('Enter on empty input neither submits nor inserts a newline', async () => {
      const onSubmit = vi.fn();
      renderWithProviders(<ChatbarFixture onSubmit={onSubmit} sendMode="always" submitOnEnter />);
      await userEvent.type(getTextarea(), '{Enter}');
      expect(onSubmit).not.toHaveBeenCalled();
      expect(getTextarea().value).toBe('');
    });

    it('does not submit while composing with an IME', async () => {
      const onSubmit = vi.fn();
      renderWithProviders(<ChatbarFixture onSubmit={onSubmit} submitOnEnter />);
      await userEvent.type(getTextarea(), 'ni');
      fireEvent.keyDown(getTextarea(), { key: 'Enter', keyCode: 229 });
      fireEvent.compositionStart(getTextarea());
      fireEvent.keyDown(getTextarea(), { key: 'Enter' });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('hidden Send is disabled, not focusable and aria-hidden', () => {
      const onSubmit = vi.fn();
      renderWithProviders(<ChatbarFixture onSubmit={onSubmit} defaultOpen />);
      const send = getRoot().querySelector('.rt-ChatbarSend') as HTMLButtonElement;
      expect(send).toBeDisabled();
      expect(send).toHaveAttribute('aria-hidden', 'true');
      expect(send).toHaveAttribute('tabindex', '-1');
    });

    it('sendMode="always" shows a disabled Send when empty', () => {
      renderWithProviders(<ChatbarFixture sendMode="always" defaultOpen />);
      const send = screen.getByRole('button', { name: 'Send' });
      expect(send).toBeDisabled();
      expect(send).not.toHaveAttribute('aria-hidden');
    });

    it('consumer onKeyDown can cancel Enter submit', async () => {
      const onSubmit = vi.fn();
      renderWithProviders(
        <Chatbar.Root onSubmit={onSubmit} defaultValue="hi">
          <Chatbar.Textarea aria-label="Message" submitOnEnter onKeyDown={(e) => e.preventDefault()} />
        </Chatbar.Root>,
      );
      fireEvent.keyDown(getTextarea(), { key: 'Enter' });
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('attachments', () => {
    it('removing an attachment moves focus to the textarea when the list empties', async () => {
      renderWithProviders(<ChatbarFixture defaultOpen />);
      pasteFiles(getTextarea(), [pngFile()]);
      const remove = screen.getByRole('button', { name: /remove image.png/i });
      await userEvent.click(remove);
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
      expect(getTextarea()).toHaveFocus();
    });

    it('announces added attachments in a live region', () => {
      renderWithProviders(<ChatbarFixture />);
      pasteFiles(getTextarea(), [pngFile()]);
      expect(screen.getByRole('status')).toHaveTextContent('1 file attached.');
    });

    it('announces repeated identical messages', () => {
      renderWithProviders(<ChatbarFixture />);
      pasteFiles(getTextarea(), [pngFile('a.png')]);
      const first = screen.getByRole('status').firstChild;
      pasteFiles(getTextarea(), [pngFile('b.png')]);
      expect(screen.getByRole('status')).toHaveTextContent('1 file attached.');
      expect(screen.getByRole('status').firstChild).not.toBe(first);
    });

    it('does not submit an attachment a controlled parent rejected', async () => {
      const onSubmit = vi.fn();
      renderWithProviders(
        <Chatbar.Root attachments={[]} onSubmit={onSubmit} open defaultValue="">
          <Chatbar.Textarea aria-label="Message" submitOnEnter />
        </Chatbar.Root>,
      );
      pasteFiles(getTextarea(), [pngFile()]);
      await Promise.resolve();
      fireEvent.keyDown(getTextarea(), { key: 'Enter' });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('AttachTrigger multiple overrides Root multiple={false}', () => {
      renderWithProviders(
        <Chatbar.Root multiple={false} open>
          <Chatbar.AttachmentsRow />
          <Chatbar.Textarea aria-label="Message" />
          <Chatbar.AttachTrigger multiple aria-label="Attach" />
        </Chatbar.Root>,
      );
      const input = getRoot().querySelector('input[type="file"]') as HTMLInputElement;
      vi.spyOn(input, 'click').mockImplementation(() => {});
      fireEvent.click(screen.getByRole('button', { name: 'Attach' }));
      expect(input.multiple).toBe(true);
      fireEvent.change(input, { target: { files: [pngFile('a.png'), pngFile('b.png')] } });
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('disables AttachTrigger when disabled or readOnly', () => {
      const { rerender } = renderWithProviders(<ChatbarFixture defaultOpen disabled />);
      expect(screen.getByRole('button', { name: 'Attach' })).toBeDisabled();
      rerender(<ChatbarFixture defaultOpen readOnly />);
      expect(screen.getByRole('button', { name: 'Attach' })).toBeDisabled();
    });
  });

  describe('file dialog guard', () => {
    it('does not collapse on blur between pointerdown and click on the trigger', async () => {
      renderWithProviders(<ChatbarFixture expandOn="focus" />);
      await userEvent.click(getTextarea());
      fireEvent.pointerDown(screen.getByRole('button', { name: /attach/i }));
      fireEvent.blur(getTextarea(), { relatedTarget: null });
      expect(getRoot()).toHaveAttribute('data-state', 'open');
    });

    it('apiRef.openFilePicker works without AttachTrigger and releases the guard on window focus', async () => {
      const apiRef = React.createRef<Chatbar.ChatbarApi>();
      renderWithProviders(
        <div>
          <Chatbar.Root apiRef={apiRef} expandOn="focus" dropzone={false}>
            <Chatbar.Textarea aria-label="Message" />
          </Chatbar.Root>
          <button aria-label="outside" />
        </div>,
      );
      const input = getRoot().querySelector('input[type="file"]') as HTMLInputElement;
      const click = vi.spyOn(input, 'click').mockImplementation(() => {});
      await userEvent.click(getTextarea());
      act(() => apiRef.current?.openFilePicker());
      expect(click).toHaveBeenCalledTimes(1);

      fireEvent.blur(getTextarea(), { relatedTarget: null });
      expect(getRoot()).toHaveAttribute('data-state', 'open');

      // Dialog closes: window regains focus, so blur collapses again
      fireEvent.focus(window);
      await userEvent.click(getTextarea());
      await userEvent.click(screen.getByLabelText('outside'));
      expect(getRoot()).toHaveAttribute('data-state', 'closed');
    });
  });
});
