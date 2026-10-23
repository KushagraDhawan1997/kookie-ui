import * as React from 'react';
import { describe, expect, test } from 'vitest';

import { renderWithProviders, screen } from '../../test-utils';
import {
  Accordion,
  Avatar,
  Blockquote,
  Box,
  Button,
  Card,
  Chip,
  Code,
  Flex,
  Grid,
  Heading,
  Image,
  Kbd,
  Link,
  Separator,
  Spinner,
  Text,
  TextArea,
  TextField,
} from '../../../src/components/index';

const TID = 'subject';

/**
 * Props that `extractProps` consumes into class names. None of them may survive
 * onto the DOM node: React forwards unknown lowercase props straight through as
 * attributes, so a mistake here is invisible until it shows up in the markup.
 */
const CONSUMED = [
  'direction',
  'align',
  'justify',
  'gap',
  'gapx',
  'gapy',
  'p',
  'px',
  'py',
  'pt',
  'pr',
  'pb',
  'pl',
  'm',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'width',
  'height',
  'minwidth',
  'maxwidth',
  'minheight',
  'maxheight',
  'position',
  'inset',
  'top',
  'right',
  'bottom',
  'left',
  'overflow',
  'overflowx',
  'overflowy',
  'flexgrow',
  'flexshrink',
  'flexbasis',
  'alignself',
  'justifyself',
  'variant',
  'size',
  'weight',
  'trim',
  'truncate',
  'wrap',
  'highcontrast',
  'aschild',
  'display',
];

const LAYOUT_PROPS = {
  p: '4',
  m: '2',
  width: '200px',
  maxWidth: '400px',
  position: 'relative',
  flexGrow: '1',
} as const;

type Case = {
  name: string;
  render: () => React.ReactElement;
  /** For components that do not forward arbitrary props such as data-testid. */
  selector?: string;
};

const CASES: Case[] = [
  { name: 'Box', render: () => <Box data-testid={TID} {...LAYOUT_PROPS} /> },
  {
    name: 'Flex',
    render: () => <Flex data-testid={TID} direction="column" align="center" justify="between" gap="3" {...LAYOUT_PROPS} />,
  },
  { name: 'Grid', render: () => <Grid data-testid={TID} columns="3" gap="2" {...LAYOUT_PROPS} /> },
  { name: 'Text', render: () => <Text data-testid={TID} size="2" weight="medium" color="gray" emphasis="medium" /> },
  { name: 'Heading', render: () => <Heading data-testid={TID} size="5" weight="semibold" /> },
  { name: 'Blockquote', render: () => <Blockquote data-testid={TID} size="2" /> },
  { name: 'Code', render: () => <Code data-testid={TID} size="2" variant="soft" /> },
  { name: 'Kbd', render: () => <Kbd data-testid={TID} size="2" /> },
  { name: 'Link', render: () => <Link data-testid={TID} href="#x" size="2" weight="medium" /> },
  {
    name: 'Button',
    render: () => (
      <Button data-testid={TID} size="2" variant="classic">
        go
      </Button>
    ),
  },
  {
    name: 'Button iconOnly',
    render: () => <Button iconOnly data-testid={TID} size="2" variant="soft" aria-label="act" />,
  },
  { name: 'Chip', render: () => <Chip data-testid={TID} size="2" variant="soft" color="gray" /> },
  { name: 'Card', render: () => <Card data-testid={TID} size="2" variant="classic" /> },
  { name: 'Separator', render: () => <Separator data-testid={TID} /> },
  { name: 'Spinner', render: () => <Spinner data-testid={TID} /> },
  {
    name: 'Image',
    render: () => <Image data-testid={TID} src="/a.jpg" alt="" width="64px" height="64px" fit="contain" />,
  },
  {
    name: 'Avatar',
    render: () => <Avatar size="3" variant="soft" fallback="A" />,
    selector: '.kui-AvatarRoot',
  },
  { name: 'TextField.Root', render: () => <TextField.Root data-testid={TID} size="2" variant="surface" /> },
  { name: 'TextArea', render: () => <TextArea data-testid={TID} size="2" variant="surface" /> },
];

describe('layout and styling props never reach the DOM', () => {
  for (const { name, render, selector } of CASES) {
    test(name, () => {
      const { container } = renderWithProviders(render());
      const element = selector ? (container.querySelector(selector) as HTMLElement) : screen.getByTestId(TID);

      expect(element, `${name} did not render a subject element`).toBeTruthy();

      const leaked = element.getAttributeNames().filter((attribute) => CONSUMED.includes(attribute.toLowerCase()));

      expect(leaked, `${name} leaked ${leaked.join(', ')} onto <${element.tagName.toLowerCase()}>`).toEqual([]);
    });
  }
});

describe('styling props produce class names', () => {
  test('scale values become value-suffixed classes', () => {
    renderWithProviders(<Flex data-testid={TID} direction="column" gap="3" p="4" />);
    const classes = screen.getByTestId(TID).className.split(' ');

    expect(classes).toEqual(expect.arrayContaining(['kui-r-fd-column', 'kui-r-gap-3', 'kui-r-p-4']));
  });

  test('arbitrary values become a bare class plus a custom property', () => {
    renderWithProviders(<Box data-testid={TID} width="37px" />);
    const element = screen.getByTestId(TID);

    expect(element.className.split(' ')).toContain('kui-r-w');
    expect(element.style.getPropertyValue('--width')).toBe('37px');
  });

  test('responsive values become breakpoint-prefixed classes', () => {
    renderWithProviders(<Flex data-testid={TID} direction={{ initial: 'column', md: 'row' }} />);
    const classes = screen.getByTestId(TID).className.split(' ');

    expect(classes).toContain('kui-r-fd-column');
    expect(classes).toContain('md:kui-r-fd-row');
  });

  test('a caller className is kept alongside the generated ones', () => {
    renderWithProviders(<Box data-testid={TID} p="2" className="mine" />);
    const classes = screen.getByTestId(TID).className.split(' ');

    expect(classes).toContain('kui-r-p-2');
    expect(classes).toContain('mine');
  });

  test('a caller style is kept alongside generated custom properties', () => {
    renderWithProviders(<Box data-testid={TID} width="37px" style={{ color: 'rgb(255, 0, 0)' }} />);
    const element = screen.getByTestId(TID);

    expect(element.style.getPropertyValue('--width')).toBe('37px');
    expect(element.style.color).toBe('rgb(255, 0, 0)');
  });
});

describe('a hoisted responsive value survives repeated renders', () => {
  test('a value with no prop def default is unchanged', () => {
    // The value is defined once, as call sites do at module scope. Mutating it
    // while resolving would change what the next render produces.
    const direction = { md: 'row' } as const;

    const first = renderWithProviders(<Flex data-testid={TID} direction={direction} />);
    const firstClassName = screen.getByTestId(TID).className;
    first.unmount();

    renderWithProviders(<Flex data-testid={TID} direction={direction} />);
    expect(screen.getByTestId(TID).className).toBe(firstClassName);
    expect(direction).toEqual({ md: 'row' });
  });

  test('a value on a prop with a default is not backfilled', () => {
    // `size` is the responsive styling prop that carries a default, so it is the
    // one where resolving `initial` writes a value. Doing that to the caller's
    // object would leave `initial: '2'` baked into a shared constant.
    const size = { md: '3' } as const;

    const first = renderWithProviders(
      <Button data-testid={TID} size={size}>
        go
      </Button>,
    );
    const firstClassName = screen.getByTestId(TID).className;
    first.unmount();

    renderWithProviders(
      <Button data-testid={TID} size={size}>
        go
      </Button>,
    );

    expect(size).toEqual({ md: '3' });
    expect(screen.getByTestId(TID).className).toBe(firstClassName);
    expect(firstClassName.split(' ')).toEqual(expect.arrayContaining(['kui-r-size-2', 'md:kui-r-size-3']));
  });
});

/**
 * A component never sets the space around itself: margin props live only on the layout
 * primitives. Every other prop-def table must leave them out, or `extractProps` would turn them
 * back into margin classes.
 */
describe('margin props live only on layout primitives', () => {
  const MARGIN_PROPS = ['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'];
  const LAYOUT_FILES = ['box.props.tsx', 'flex.props.tsx', 'grid.props.tsx'];
  const modules = import.meta.glob<Record<string, unknown>>(
    ['../../../src/components/*.props.tsx', '../../../src/components/_internal/*.props.ts'],
    { eager: true },
  );
  const sources = import.meta.glob<string>(
    ['../../../src/components/*.tsx', '../../../src/components/_internal/*.tsx'],
    { eager: true, query: '?raw', import: 'default' },
  );
  const LAYOUT_SOURCES = ['box.tsx', 'flex.tsx', 'grid.tsx'];

  test('no component outside the layout primitives extracts margin props', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(40);
    expect(sources['../../../src/components/box.tsx']).toMatch(/marginPropDefs/);
    const leaks = Object.entries(sources)
      .filter(([path]) => !LAYOUT_SOURCES.includes(path.split('/').pop()!))
      .filter(([, source]) => /\b(marginPropDefs|extractMarginProps|getMarginStyles)\b/.test(source))
      .map(([path]) => path.split('/').pop());

    expect(leaks).toEqual([]);
  });

  test('the glob found the prop-def files', () => {
    expect(Object.keys(modules).length).toBeGreaterThan(20);
  });

  for (const [path, module] of Object.entries(modules)) {
    const file = path.split('/').pop()!;
    if (LAYOUT_FILES.includes(file)) continue;

    test(file, () => {
      for (const [name, value] of Object.entries(module)) {
        if (!name.endsWith('PropDefs') || typeof value !== 'object' || value === null) continue;
        const leaked = Object.keys(value).filter((key) => MARGIN_PROPS.includes(key));
        expect(leaked, `${file} ${name} declares ${leaked.join(', ')}`).toEqual([]);
      }
    });
  }

  test('a non-layout component turns no margin prop into a margin class', () => {
    const props = { m: '2', mt: '3' } as Record<string, string>;
    renderWithProviders(<Text data-testid={TID} {...props} />);
    const classes = screen.getByTestId(TID).className.split(' ');

    expect(classes.filter((name) => /^kui-r-m[xytrbl]?-/.test(name))).toEqual([]);
  });

  test('Box still turns margin props into margin classes', () => {
    renderWithProviders(<Box data-testid={TID} m="2" mt="3" />);
    const classes = screen.getByTestId(TID).className.split(' ');

    expect(classes).toEqual(expect.arrayContaining(['kui-r-m-2', 'kui-r-mt-3']));
  });

  test('Accordion has no flush mode: the parent bleed covers it', () => {
    const props = { flush: true } as Record<string, boolean>;
    renderWithProviders(
      <Accordion.Root data-testid={TID} type="single" variant="ghost" {...props}>
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger>A</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );

    expect(screen.getByTestId(TID)).not.toHaveAttribute('data-flush');
  });
});
