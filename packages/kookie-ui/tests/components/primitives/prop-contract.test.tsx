import * as React from 'react';
import { describe, expect, test } from 'vitest';

import { renderWithProviders, screen } from '../../test-utils';
import {
  Avatar,
  Badge,
  Blockquote,
  Box,
  Button,
  Card,
  Code,
  Container,
  Em,
  Flex,
  Grid,
  Heading,
  IconButton,
  Kbd,
  Link,
  Separator,
  Skeleton,
  Spinner,
  Strong,
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
  { name: 'Container', render: () => <Container data-testid={TID} size="2" {...LAYOUT_PROPS} /> },
  { name: 'Text', render: () => <Text data-testid={TID} size="2" weight="medium" color="gray" emphasis="medium" m="2" /> },
  { name: 'Heading', render: () => <Heading data-testid={TID} size="5" weight="bold" mb="3" /> },
  { name: 'Blockquote', render: () => <Blockquote data-testid={TID} size="2" m="1" /> },
  { name: 'Code', render: () => <Code data-testid={TID} size="2" variant="soft" m="1" /> },
  { name: 'Em', render: () => <Em data-testid={TID} /> },
  { name: 'Strong', render: () => <Strong data-testid={TID} /> },
  { name: 'Kbd', render: () => <Kbd data-testid={TID} size="2" m="1" /> },
  { name: 'Link', render: () => <Link data-testid={TID} href="#x" size="2" weight="medium" m="1" /> },
  {
    name: 'Button',
    render: () => (
      <Button data-testid={TID} size="2" variant="classic" m="2">
        go
      </Button>
    ),
  },
  {
    name: 'IconButton',
    render: () => <IconButton data-testid={TID} size="2" variant="soft" aria-label="act" m="2" />,
  },
  { name: 'Badge', render: () => <Badge data-testid={TID} size="2" variant="soft" color="gray" m="1" /> },
  { name: 'Card', render: () => <Card data-testid={TID} size="2" variant="classic" m="2" /> },
  { name: 'Separator', render: () => <Separator data-testid={TID} size="2" my="2" /> },
  { name: 'Spinner', render: () => <Spinner data-testid={TID} size="2" m="1" /> },
  { name: 'Skeleton', render: () => <Skeleton data-testid={TID} width="100px" height="20px" /> },
  {
    name: 'Avatar',
    render: () => <Avatar size="3" variant="soft" fallback="A" m="1" />,
    selector: '.rt-AvatarRoot',
  },
  { name: 'TextField.Root', render: () => <TextField.Root data-testid={TID} size="2" variant="surface" m="1" /> },
  { name: 'TextArea', render: () => <TextArea data-testid={TID} size="2" variant="surface" m="1" /> },
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

    expect(classes).toEqual(expect.arrayContaining(['rt-r-fd-column', 'rt-r-gap-3', 'rt-r-p-4']));
  });

  test('arbitrary values become a bare class plus a custom property', () => {
    renderWithProviders(<Box data-testid={TID} width="37px" />);
    const element = screen.getByTestId(TID);

    expect(element.className.split(' ')).toContain('rt-r-w');
    expect(element.style.getPropertyValue('--width')).toBe('37px');
  });

  test('responsive values become breakpoint-prefixed classes', () => {
    renderWithProviders(<Flex data-testid={TID} direction={{ initial: 'column', md: 'row' }} />);
    const classes = screen.getByTestId(TID).className.split(' ');

    expect(classes).toContain('rt-r-fd-column');
    expect(classes).toContain('md:rt-r-fd-row');
  });

  test('a caller className is kept alongside the generated ones', () => {
    renderWithProviders(<Box data-testid={TID} p="2" className="mine" />);
    const classes = screen.getByTestId(TID).className.split(' ');

    expect(classes).toContain('rt-r-p-2');
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
    expect(firstClassName.split(' ')).toEqual(expect.arrayContaining(['rt-r-size-2', 'md:rt-r-size-3']));
  });
});
