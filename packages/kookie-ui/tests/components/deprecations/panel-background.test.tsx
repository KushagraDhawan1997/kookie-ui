import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { renderWithProviders } from '../../test-utils';
import { Accordion, AlertDialog, Badge, Button, Dialog, DropdownMenu, Theme } from '../../../src/components/index';

const DEPRECATION = /panelBackground.*deprecated/i;

function warnings(spy: ReturnType<typeof vi.spyOn>) {
  return spy.mock.calls.map((call) => String(call[0]));
}

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  // The warning is logged once per session, so each test needs a fresh module.
  vi.resetModules();
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * `material` is the prop the deprecation notice tells you to migrate *to*.
 * Dialog and AlertDialog used to fire the notice when it was set — from inside
 * a `useMemo`, unguarded in production — so using the library correctly logged
 * a warning telling you that you were not.
 */
describe('the material prop never triggers the panelBackground warning', () => {
  const CASES: Array<[string, () => React.ReactElement]> = [
    ['Button', () => <Button material="translucent">go</Button>],
    ['Badge', () => <Badge material="translucent">new</Badge>],
    ['Theme', () => <Theme material="translucent">content</Theme>],
    [
      'Dialog.Content',
      () => (
        <Dialog.Root open>
          <Dialog.Content material="translucent">
            <Dialog.Title>t</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>
      ),
    ],
    [
      'AlertDialog.Content',
      () => (
        <AlertDialog.Root open>
          <AlertDialog.Content material="translucent">
            <AlertDialog.Title>t</AlertDialog.Title>
          </AlertDialog.Content>
        </AlertDialog.Root>
      ),
    ],
    [
      'DropdownMenu.Content',
      () => (
        <DropdownMenu.Root open>
          <DropdownMenu.Trigger>
            <button type="button">open</button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content material="translucent">
            <DropdownMenu.Item>one</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    ],
    [
      'Accordion.Root',
      () => (
        <Accordion.Root type="single" material="translucent">
          <Accordion.Item value="a">
            <Accordion.Trigger>t</Accordion.Trigger>
            <Accordion.Content>c</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      ),
    ],
  ];

  for (const [name, render] of CASES) {
    test(name, () => {
      renderWithProviders(render());
      const deprecations = warnings(warn).filter((message) => DEPRECATION.test(message));
      expect(deprecations, `${name} warned about panelBackground for a material prop`).toEqual([]);
    });
  }
});

describe('the panelBackground prop still warns', () => {
  // The warning deliberately fires once per session rather than once per
  // component, so both halves of that contract are asserted in a single test:
  // a second test in this file would run against an already-spent latch.
  test('it warns, and only once however many components use it', () => {
    renderWithProviders(
      <>
        <Button panelBackground="translucent">a</Button>
        <Button panelBackground="translucent">b</Button>
        <Button panelBackground="translucent">c</Button>
        <Badge panelBackground="translucent">d</Badge>
      </>,
    );

    expect(warnings(warn).filter((m) => DEPRECATION.test(m))).toHaveLength(1);
  });
});

describe('nothing warns on the ordinary path', () => {
  test('a plain screen of components logs nothing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
      <>
        <Button size="2" variant="classic">
          Save
        </Button>
        <Badge size="2" variant="soft" color="gray">
          Active
        </Badge>
        <Theme appearance="dark">
          <Button variant="soft">Nested</Button>
        </Theme>
      </>,
    );

    expect(warnings(warn)).toEqual([]);
    expect(error.mock.calls.map((c) => String(c[0]))).toEqual([]);
  });
});
