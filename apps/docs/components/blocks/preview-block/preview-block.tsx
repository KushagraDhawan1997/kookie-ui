'use client';

import * as React from 'react';
import { Box, Card, Flex, SegmentedControl, Theme } from '@kushagradhawan/kookie-ui';
import type { BoxProps, FlexProps } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Moon02Icon, Sun01Icon } from '@hugeicons/core-free-icons';

type PaddingProps = Pick<FlexProps, 'p' | 'px' | 'py' | 'pt' | 'pr' | 'pb' | 'pl'>;
type MarginProps = Pick<BoxProps, 'm' | 'mx' | 'my' | 'mt' | 'mr' | 'mb' | 'ml'>;

export interface PreviewBlockProps extends PaddingProps, MarginProps {
  children: React.ReactNode;
  /** A preset pattern, or your own CSS for the stage. @default "dots" */
  background?: 'none' | 'dots' | 'grid' | React.CSSProperties;
  /** Spacing of the dots or grid lines, in pixels. @default 24 */
  patternSize?: number;
  /** Pattern color. Defaults to `--gray-a6` for dots and `--gray-a3` for grid. */
  patternColor?: string;
  width?: string;
  /** Fixed height. Without it the stage is at least 240px tall. */
  height?: string;
  /** @default "soft" */
  variant?: 'surface' | 'classic' | 'soft' | 'ghost';
  /** Starting appearance for the preview. */
  appearance?: 'light' | 'dark' | 'inherit';
  /** Show a light/dark switch in the corner. @default true */
  showThemeToggle?: boolean;
  /** @default "sans" */
  fontFamily?: 'sans' | 'mono' | 'serif';
}

function getPatternStyle(
  background: PreviewBlockProps['background'],
  patternSize: number,
  patternColor: string | undefined,
): React.CSSProperties | undefined {
  if (typeof background === 'object') return background;

  const size = `${patternSize}px ${patternSize}px`;
  if (background === 'dots') {
    const color = patternColor ?? 'var(--gray-a6)';
    return {
      backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
      backgroundSize: size,
      backgroundPosition: 'center',
    };
  }
  if (background === 'grid') {
    const color = patternColor ?? 'var(--gray-a3)';
    return {
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: size,
      backgroundPosition: 'center',
    };
  }
  return undefined;
}

/** A framed stage for live component previews, with an optional light/dark switch. */
export function PreviewBlock({
  children,
  background = 'dots',
  patternSize = 24,
  patternColor,
  width,
  height,
  variant = 'soft',
  appearance,
  showThemeToggle = true,
  fontFamily = 'sans',
  p = '2',
  px,
  py,
  pt,
  pr,
  pb,
  pl,
  m,
  mx,
  my = '3',
  mt,
  mr,
  mb,
  ml,
}: PreviewBlockProps) {
  const [currentAppearance, setCurrentAppearance] = React.useState<'light' | 'dark' | 'inherit'>(
    appearance ?? 'inherit',
  );
  const patternStyle = getPatternStyle(background, patternSize, patternColor);

  return (
    <Theme
      hasBackground={false}
      fontFamily={fontFamily}
      appearance={showThemeToggle ? currentAppearance : appearance}
    >
      <Box m={m} mx={mx} my={my} mt={mt} mr={mr} mb={mb} ml={ml}>
        <Card size="1" variant={variant} style={{ position: 'relative', padding: 0 }}>
          {showThemeToggle && (
            <Box position="absolute" top="2" right="2" style={{ zIndex: 1 }}>
              <SegmentedControl.Root
                size="2"
                value={currentAppearance === 'inherit' ? 'light' : currentAppearance}
                onValueChange={(value) => setCurrentAppearance(value === 'dark' ? 'dark' : 'light')}
              >
                <SegmentedControl.Item value="light" iconOnly aria-label="Light preview">
                  <HugeiconsIcon icon={Sun01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="dark" iconOnly aria-label="Dark preview">
                  <HugeiconsIcon icon={Moon02Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>
          )}
          <Flex
            direction="column"
            p={p}
            px={px}
            py={py}
            pt={pt}
            pr={pr}
            pb={pb}
            pl={pl}
            minHeight={height ? undefined : '240px'}
          >
            <Flex flexGrow="1" justify="center" align="center" width={width} height={height} style={patternStyle}>
              {children}
            </Flex>
          </Flex>
        </Card>
      </Box>
    </Theme>
  );
}
