'use client';

import React from 'react';
import { Box, Flex, Navigator, NavigatorLink, NavigatorScreen, Shell, Switch, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

type ScreenId = 'notifications' | 'email';

const STARTS: { label: string; value: string; path: ScreenId[] }[] = [
  { label: 'Settings', value: 'settings', path: [] },
  { label: 'Notifications', value: 'notifications', path: ['notifications'] },
  { label: 'Email', value: 'email', path: ['notifications', 'email'] },
];

function Setting({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <Text as="label" size="2">
      <Flex align="center" justify="between" gap="4" py="2" px="2">
        {label}
        <Switch defaultChecked={defaultChecked} />
      </Flex>
    </Text>
  );
}

function screen(id: ScreenId) {
  if (id === 'notifications') {
    return (
      <NavigatorScreen title="Notifications">
        <Setting label="Mentions" defaultChecked />
        <Setting label="Comments on your files" defaultChecked />
        <NavigatorLink value="email">Email</NavigatorLink>
      </NavigatorScreen>
    );
  }
  return (
    <NavigatorScreen title="Email">
      <Setting label="Weekly digest" defaultChecked />
      <Setting label="Product news" />
    </NavigatorScreen>
  );
}

const root = (
  <NavigatorScreen title="Settings">
    <NavigatorLink value="notifications">Notifications</NavigatorLink>
    <Setting label="Show line numbers" defaultChecked />
  </NavigatorScreen>
);

type NavigatorPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function NavigatorPlayground({ showControls = false, showToolbar = true, height = '26rem' }: NavigatorPlaygroundProps = {}) {
  const [path, setPath] = React.useState<ScreenId[]>([]);
  const start = STARTS.find((option) => option.path.join('/') === path.join('/'))?.value ?? 'settings';

  const items = [
    {
      id: 'path',
      label: 'Path',
      type: 'select' as const,
      value: start,
      onChange: (next: string) => setPath(STARTS.find((option) => option.value === next)?.path ?? []),
      options: STARTS.map(({ label, value }) => ({ label, value })),
      placeholder: 'Select screen',
    },
  ];

  const code = `const [path, setPath] = React.useState<ScreenId[]>(${JSON.stringify(path).replace(/"/g, "'")});

<Shell.Sidebar aria-label="Settings">
  <Navigator
    path={path}
    onPathChange={setPath}
    root={
      <NavigatorScreen title="Settings">
        <NavigatorLink value="notifications">Notifications</NavigatorLink>
      </NavigatorScreen>
    }
    screen={(id: ScreenId) =>
      id === 'notifications' ? (
        <NavigatorScreen title="Notifications">
          <NavigatorLink value="email">Email</NavigatorLink>
        </NavigatorScreen>
      ) : (
        <NavigatorScreen title="Email">…</NavigatorScreen>
      )
    }
  />
</Shell.Sidebar>`;

  return (
    <Playground
      component={
        <Box width="560px" maxWidth="100%" px="4">
          <Shell.Root height="320px" style={{ borderRadius: 'var(--radius-surface-2)', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--neutral-a5)' }}>
            <Shell.Sidebar presentation="fixed" defaultState="expanded" expandedSize={300} aria-label="Settings">
              <Navigator path={path} onPathChange={setPath} root={root} screen={screen} />
            </Shell.Sidebar>
            <Shell.Content>
              <Flex align="center" justify="center" height="100%" p="4">
                <Text size="2" emphasis="medium">
                  Your app
                </Text>
              </Flex>
            </Shell.Content>
          </Shell.Root>
        </Box>
      }
      code={code}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
