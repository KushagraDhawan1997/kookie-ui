import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@kushagradhawan/kookie-ui';
import { TableScene } from './scenes/table';
import { FormScene } from './scenes/form';
import { MenuScene } from './scenes/menu';
import { DialogsScene } from './scenes/dialogs';
import { ShellScene } from './scenes/shell';
import { ComponentsScene } from './components';

const SCENES: Record<string, () => React.ReactElement> = {
  table: TableScene,
  form: FormScene,
  menu: MenuScene,
  dialogs: DialogsScene,
  shell: ShellScene,
  components: ComponentsScene,
};

const name = new URLSearchParams(location.search).get('scene') ?? 'table';
const Scene = SCENES[name];

createRoot(document.getElementById('root')!).render(
  <Theme>{Scene ? <Scene /> : <p>Unknown scene. Try one of: {Object.keys(SCENES).join(', ')}</p>}</Theme>,
);
