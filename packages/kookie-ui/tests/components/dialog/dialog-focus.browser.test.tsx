import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { AlertDialog, Dialog, Sheet, Theme } from '../../../src/components/index';

// Focus, naming and ids for the three modal overlays. Radix owns the focus trap, the initial
// focus and the return of focus; these tests hold the wrappers to that.

describe('AlertDialog description', () => {
  it('points aria-describedby at the Description without a fixed id', async () => {
    render(
      <Theme>
        <AlertDialog.Root open>
          <AlertDialog.Content>
            <AlertDialog.Title>Delete project?</AlertDialog.Title>
            <AlertDialog.Description>This can't be undone.</AlertDialog.Description>
            <AlertDialog.Cancel>
              <button>Cancel</button>
            </AlertDialog.Cancel>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Theme>,
    );
    const dialog = screen.getByRole('alertdialog');
    const description = screen.getByText("This can't be undone.");
    expect(description.id).not.toBe('');
    expect(dialog.getAttribute('aria-describedby')).toBe(description.id);
  });

  it('keeps an aria-describedby the caller passes', () => {
    render(
      <Theme>
        <AlertDialog.Root open>
          <AlertDialog.Content aria-describedby="custom">
            <AlertDialog.Title>Delete project?</AlertDialog.Title>
            <p id="custom">Custom description</p>
            <AlertDialog.Cancel>
              <button>Cancel</button>
            </AlertDialog.Cancel>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Theme>,
    );
    expect(screen.getByRole('alertdialog').getAttribute('aria-describedby')).toBe('custom');
  });
});

describe('AlertDialog initial focus', () => {
  it('focuses Cancel even when Action comes first', async () => {
    render(
      <Theme>
        <AlertDialog.Root defaultOpen>
          <AlertDialog.Content aria-describedby={undefined}>
            <AlertDialog.Title>Delete project?</AlertDialog.Title>
            <AlertDialog.Action>
              <button>Delete</button>
            </AlertDialog.Action>
            <AlertDialog.Cancel>
              <button>Cancel</button>
            </AlertDialog.Cancel>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Theme>,
    );
    await waitFor(() => expect(document.activeElement).toBe(screen.getByText('Cancel')));
  });
});

describe('focus returns to the trigger', () => {
  it('Dialog', async () => {
    render(
      <Theme>
        <Dialog.Root>
          <Dialog.Trigger>
            <button>Open</button>
          </Dialog.Trigger>
          <Dialog.Content aria-describedby={undefined}>
            <Dialog.Title>Title</Dialog.Title>
            <Dialog.Close>
              <button>Close</button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </Theme>,
    );
    await userEvent.click(screen.getByText('Open'));
    await userEvent.click(await screen.findByText('Close'));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByText('Open')));
  });

  it('AlertDialog', async () => {
    render(
      <Theme>
        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <button>Open</button>
          </AlertDialog.Trigger>
          <AlertDialog.Content aria-describedby={undefined}>
            <AlertDialog.Title>Title</AlertDialog.Title>
            <AlertDialog.Cancel>
              <button>Cancel</button>
            </AlertDialog.Cancel>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Theme>,
    );
    await userEvent.click(screen.getByText('Open'));
    await userEvent.click(await screen.findByText('Cancel'));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByText('Open')));
  });

  it("calls the caller's onCloseAutoFocus, and preventDefault keeps focus where it is", async () => {
    const onCloseAutoFocus = vi.fn((event: Event) => event.preventDefault());
    render(
      <Theme>
        <Dialog.Root>
          <Dialog.Trigger>
            <button>Open</button>
          </Dialog.Trigger>
          <Dialog.Content aria-describedby={undefined} onCloseAutoFocus={onCloseAutoFocus}>
            <Dialog.Title>Title</Dialog.Title>
            <Dialog.Close>
              <button>Close</button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </Theme>,
    );
    await userEvent.click(screen.getByText('Open'));
    await userEvent.click(await screen.findByText('Close'));
    await waitFor(() => expect(onCloseAutoFocus).toHaveBeenCalledTimes(1));
    expect(document.activeElement).not.toBe(screen.getByText('Open'));
  });
});

function GrowingDialog() {
  const [extra, setExtra] = React.useState(false);
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Content aria-describedby={undefined}>
        <Dialog.Title>Title</Dialog.Title>
        <button onClick={() => setExtra(true)}>Add</button>
        <button>Second</button>
        {extra && <button>Third</button>}
      </Dialog.Content>
    </Dialog.Root>
  );
}

describe('focus trap', () => {
  it('Tab reaches a control added after the dialog opened', async () => {
    render(
      <Theme>
        <GrowingDialog />
      </Theme>,
    );
    await userEvent.click(await screen.findByText('Add'));
    screen.getByText('Second').focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(screen.getByText('Third'));
  });

  it('Sheet: Tab reaches a control added after the sheet opened', async () => {
    function GrowingSheet() {
      const [extra, setExtra] = React.useState(false);
      return (
        <Sheet.Root defaultOpen>
          <Sheet.Content aria-describedby={undefined}>
            <Sheet.Title>Title</Sheet.Title>
            <button onClick={() => setExtra(true)}>Add</button>
            <button>Second</button>
            {extra && <button>Third</button>}
          </Sheet.Content>
        </Sheet.Root>
      );
    }
    render(
      <Theme>
        <GrowingSheet />
      </Theme>,
    );
    await userEvent.click(await screen.findByText('Add'));
    screen.getByText('Second').focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(screen.getByText('Third'));
  });
});

describe('ids', () => {
  it('two open dialogs render no duplicate ids', () => {
    render(
      <Theme>
        <Dialog.Root open>
          <Dialog.Content aria-describedby={undefined}>
            <Dialog.Title>One</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>
        <Dialog.Root open>
          <Dialog.Content aria-describedby={undefined}>
            <Dialog.Title>Two</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>
        <AlertDialog.Root open>
          <AlertDialog.Content aria-describedby={undefined}>
            <AlertDialog.Title>Three</AlertDialog.Title>
          </AlertDialog.Content>
        </AlertDialog.Root>
        <AlertDialog.Root open>
          <AlertDialog.Content aria-describedby={undefined}>
            <AlertDialog.Title>Four</AlertDialog.Title>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Theme>,
    );
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
