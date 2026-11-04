import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Shell, Theme } from '../../../src/components/index';

function App() {
  return (
    <Theme>
      <Shell.Root>
        <Shell.Sidebar defaultState="expanded" defaultSize={232} presentation="fixed">
          Layers
        </Shell.Sidebar>
        <Shell.Content>Canvas</Shell.Content>
        <Shell.Inspector defaultState="expanded" defaultSize={500} maxSize={400} presentation="fixed">
          Props
        </Shell.Inspector>
      </Shell.Root>
    </Theme>
  );
}

describe('Shell pane sizes on the server', () => {
  it('puts a numeric defaultSize in the server HTML, clamped to the pane limits', () => {
    const html = renderToString(<App />);
    expect(html).toContain('--sidebar-size:232px');
    expect(html).toContain('--inspector-size:400px');
  });

  it('does the same for Shell.Panel and Shell.Bottom', () => {
    const html = renderToString(
      <Theme>
        <Shell.Root>
          <Shell.Rail defaultOpen presentation="fixed">
            Rail
          </Shell.Rail>
          <Shell.Panel defaultOpen defaultSize={300} presentation="fixed">
            Panel
          </Shell.Panel>
          <Shell.Content>Canvas</Shell.Content>
          <Shell.Bottom defaultOpen defaultSize={320} presentation="fixed">
            Console
          </Shell.Bottom>
        </Shell.Root>
      </Theme>,
    );
    expect(html).toContain('--panel-size:300px');
    expect(html).toContain('--bottom-size:320px');
  });
});
