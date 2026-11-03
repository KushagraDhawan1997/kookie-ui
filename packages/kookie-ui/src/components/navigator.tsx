'use client';

/**
 * Navigator, from v2 (2026-11-03): a stack of screens, any depth. Any screen can open another on
 * top of it, and Back removes the top one. The first screen is the root and never goes.
 *
 * THE PATH IS DATA. The screens above the root are a list of values the app owns, and `screen`
 * turns a value into a screen, so an app can keep the path in its URL, restore it, or open three
 * levels deep from a link.
 *
 * IT HAS NO REGION OF ITS OWN. The host decides how a screen carries its title. In
 * `Shell.Content` a screen is a `Page`, whose large title collapses into the band with Back. In a
 * side pane (Sidebar, Panel, Inspector, Bottom) the band holds Back and the title from the start.
 * Anywhere else (a card, a Dialog, a Sheet, a Popover) each screen draws its own band: Back, the
 * title, and the overlay's close when it has one.
 *
 * SCREENS UNDER THE TOP STAY MOUNTED, hidden, so a list keeps its scroll and a field its draft.
 *
 * Focus: a pushed screen takes focus at its top; on pop, focus returns to the control that opened
 * the screen. Escape never goes back; it belongs to whatever overlay holds this.
 *
 * Differs from v2 in look only: no motion, since v1 has none. v1 has no Row yet, so
 * `NavigatorLink` is its own row.
 */

import * as React from 'react';
import classNames from 'classnames';

import { NavigatorHostContext } from './_internal/navigator-host.js';
import { PaneHeader, Scroll, ShellContentContext } from './_internal/pane-chrome.js';
import { setPageCollapsed, useClaimPage, usePageScope } from './_internal/page-scope.js';
import { Flex } from './flex.js';
import { Heading } from './heading.js';
import { Page } from './page.js';
import { Toolbar, ToolbarButton, ToolbarTitle } from './toolbar.js';

type NavigatorApi<T> = {
  /** The values above the root, bottom first. Empty at the root. */
  path: readonly T[];
  /** Open a screen on top. */
  push: (value: T) => void;
  /** Close the top screen. Does nothing at the root. */
  pop: () => void;
  /** Close every screen above `depth`, where 0 is the root. */
  popTo: (depth: number) => void;
  /** Whether there is a screen to go back to. */
  canGoBack: boolean;
};

type NavigatorState = NavigatorApi<unknown> & {
  /** Each level's title, so Back can name the screen it returns to and a pane's band can show it. */
  titles: React.MutableRefObject<(string | undefined)[]>;
  setTitle: (depth: number, title: string) => void;
  /** The control that opened each level, so focus can go back to it. */
  openers: React.MutableRefObject<(HTMLElement | null)[]>;
  direction: 'push' | 'pop' | null;
  inPane: boolean;
};

const NavigatorContext = React.createContext<NavigatorState | null>(null);
const LevelContext = React.createContext<number>(0);
const OutletContext = React.createContext<React.ReactNode>(null);

/**
 * True in a Shell pane, `Shell.Content` included, and not in an overlay opened from one: there
 * the pane's band carries Back and the title. Overlays cut the pane's page scope at the portal.
 */
function useInPane() {
  const scope = usePageScope();
  const host = React.useContext(NavigatorHostContext);
  return scope !== null && host === null;
}

// Activity keeps a hidden screen's state and cleans up its effects (React 19.2). On an older
// React, the screen is kept in a hidden element instead, with its effects still running.
const Activity = (React as { Activity?: React.ComponentType<{ mode: 'visible' | 'hidden'; children: React.ReactNode }> }).Activity;

function Level({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  if (Activity) return <Activity mode={visible ? 'visible' : 'hidden'}>{children}</Activity>;
  return (
    <div hidden={!visible} style={{ display: visible ? 'contents' : 'none' }}>
      {children}
    </div>
  );
}

interface NavigatorProps<T> {
  /** The screens above the root, as values. Use it with `onPathChange` to control the path. */
  path?: readonly T[];
  /** The path to start with when the navigator controls its own path. */
  defaultPath?: readonly T[];
  /** Called with the new path whenever a screen opens or closes. */
  onPathChange?: (path: T[]) => void;
  /** Turns a value from the path into its screen, usually a `NavigatorScreen`. */
  screen: (value: T) => React.ReactNode;
  /** The root screen, usually a `NavigatorScreen`. It is always at the bottom and never closes. */
  root: React.ReactNode;
  /**
   * The frame around the screens, when you need your own: a `Shell.PaneHeader` with actions, and
   * a `Shell.Scroll` holding `NavigatorOutlet`. Leave it out and the navigator draws the frame: in
   * a Shell pane, the pane's band with Back and the title, and its scroller; anywhere else, the
   * screens on their own.
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A stack of screens: any screen can open another on top, and Back returns to the one below.
 * `root` is the first screen, `screen` turns each value in the path into its screen, and
 * `children`, when given, is the frame the screens go into through `NavigatorOutlet`.
 */
function Navigator<T>({ path: pathProp, defaultPath, onPathChange, screen, root, children, className, style }: NavigatorProps<T>) {
  const inPane = useInPane();
  const [own, setOwn] = React.useState<readonly T[]>(defaultPath ?? []);
  const path = pathProp ?? own;
  // The direction comes from the path itself, so a path the app sets moves focus the same way as
  // one changed by push and pop. Equal length with a new top value is a new screen arriving.
  const [seen, setSeen] = React.useState<{ path: readonly T[]; direction: 'push' | 'pop' | null }>({ path, direction: null });
  let direction = seen.direction;
  // Compared by content, not identity: a controlled `path` may be a new array every render.
  if (seen.path.length !== path.length || seen.path.some((value, i) => !Object.is(value, path[i]))) {
    const before = seen.path;
    direction = path.length < before.length ? 'pop' : path.length > before.length || !Object.is(path[path.length - 1], before[before.length - 1]) ? 'push' : seen.direction;
    setSeen({ path, direction });
  }
  const titles = React.useRef<(string | undefined)[]>([]);
  const openers = React.useRef<(HTMLElement | null)[]>([]);
  const [version, setVersion] = React.useState(0);

  const change = React.useCallback(
    (next: T[]) => {
      if (pathProp === undefined) setOwn(next);
      onPathChange?.(next);
    },
    [pathProp, onPathChange],
  );

  const api = React.useMemo<NavigatorState>(
    () => ({
      path,
      canGoBack: path.length > 0,
      push: (value) => {
        openers.current[path.length + 1] = typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null);
        change([...path, value as T]);
      },
      pop: () => {
        if (path.length > 0) change(path.slice(0, -1));
      },
      popTo: (depth) => {
        if (depth < path.length) change(path.slice(0, Math.max(0, depth)));
      },
      titles,
      openers,
      setTitle: (depth, title) => {
        if (titles.current[depth] === title) return;
        titles.current[depth] = title;
        setVersion((v) => v + 1);
      },
      direction,
      inPane,
    }),
    // `version` is read through `titles`; it is here so a new title reaches the band and Back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, change, version, direction, inPane],
  );

  // On pop, focus goes back to the control that opened the screen that just closed.
  const previousDepth = React.useRef(path.length);
  React.useEffect(() => {
    const before = previousDepth.current;
    previousDepth.current = path.length;
    if (path.length < before) {
      const opener = openers.current[before];
      openers.current.length = path.length + 1;
      if (opener && opener.isConnected) opener.focus();
    }
  }, [path.length]);

  const levels = [root, ...path.map((value) => screen(value))];
  const top = levels.length - 1;
  const outlet = (
    <div className={classNames('kui-Navigator', className)} style={style}>
      {levels.map((level, depth) => (
        // Keyed by depth AND value, so a path that replaces the screen at a depth mounts a new
        // screen instead of handing it the old one's state.
        <Level key={depth === 0 ? 'root' : `${depth}:${String(path[depth - 1])}`} visible={depth === top}>
          <LevelContext.Provider value={depth}>
            <div className="kui-NavigatorLevel">{level}</div>
          </LevelContext.Provider>
        </Level>
      ))}
    </div>
  );

  return (
    <NavigatorContext.Provider value={api}>
      <OutletContext.Provider value={outlet}>{children ?? (inPane ? <PaneFrame /> : outlet)}</OutletContext.Provider>
    </NavigatorContext.Provider>
  );
}

/**
 * The pane's frame: Back and the top screen's title as one cluster at the start of the pane's
 * band, and the screens in the pane's scroller. Pass children to the Navigator instead when the
 * band needs actions of its own, and put `NavigatorBack` and `NavigatorTitle` in it, together in
 * a `Flex`.
 */
function PaneFrame() {
  return (
    <>
      <PaneHeader>
        <Toolbar>
          {/* One cluster: as two loose toolbar children, the band splits them to its two ends. */}
          <Flex align="center">
            <NavigatorBack />
            <ToolbarTitle />
          </Flex>
        </Toolbar>
      </PaneHeader>
      <Scroll>
        <NavigatorOutlet />
      </Scroll>
    </>
  );
}

/** Where the screens go, inside a frame passed as the navigator's children. */
function NavigatorOutlet() {
  return <>{React.useContext(OutletContext)}</>;
}

function useNavigatorState(): NavigatorState {
  const state = React.useContext(NavigatorContext);
  if (!state) throw new Error('Kookie: this part must be inside a <Navigator>.');
  return state;
}

/** The navigator around this component: its path, and `push`, `pop` and `popTo`. */
function useNavigator<T = unknown>(): NavigatorApi<T> {
  return useNavigatorState() as NavigatorApi<T>;
}

function BackGlyph() {
  return (
    <svg className="kui-NavigatorBackGlyph" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  );
}

function backLabel(state: NavigatorState, depth: number) {
  const previous = depth > 0 ? state.titles.current[depth - 1] : undefined;
  return previous ? `Back to ${previous}` : 'Back';
}

interface NavigatorBackProps {
  /** The accessible name. The default is "Back to" and the previous screen's title. */
  'aria-label'?: string;
}

/**
 * Back, for a toolbar: a chevron that closes the top screen. It is absent at the root rather than
 * disabled, because there is nowhere to go back to. It names the screen it returns to, so a screen
 * reader hears "Back to Settings".
 */
function NavigatorBack(props: NavigatorBackProps) {
  const state = useNavigatorState();
  if (!state.canGoBack) return null;
  return (
    <ToolbarButton iconOnly aria-label={props['aria-label'] ?? backLabel(state, state.path.length)} onClick={state.pop}>
      <BackGlyph />
    </ToolbarButton>
  );
}

/**
 * The top screen's title, for a toolbar in a frame of your own. In a pane it is the band's
 * mirroring `Toolbar.Title`, which shows once the page's large title has scrolled away.
 */
function NavigatorTitle() {
  const state = useNavigatorState();
  if (state.inPane) return <ToolbarTitle />;
  return <ToolbarTitle>{state.titles.current[state.path.length]}</ToolbarTitle>;
}

interface NavigatorScreenProps {
  /** The screen's title. In a pane it shows in the pane's band; elsewhere in the screen's own. */
  title: string;
  /** The screen's content, under its title. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * One screen in a navigator. In a Shell pane the pane's band carries Back and its title, so the
 * screen is only its content. Anywhere else it draws its own band: Back, the title, and the
 * overlay's close when it sits in one. In a Dialog, Sheet or Popover the title names the panel.
 */
function NavigatorScreen({ title, children, className }: NavigatorScreenProps) {
  const state = useNavigatorState();
  const depth = React.useContext(LevelContext);
  const Host = React.useContext(NavigatorHostContext);
  const inWorkArea = React.useContext(ShellContentContext);
  const node = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    state.setTitle(depth, title);
  }, [state, depth, title]);

  // A pushed screen takes focus at its top, so a keyboard and a screen reader start there. In a
  // pane the title is in the band, outside the screen, so the screen itself takes it.
  React.useEffect(() => {
    if (depth === 0 || state.direction !== 'push') return;
    const target = node.current?.querySelector<HTMLElement>('.kui-NavigatorBar .kui-ToolbarTitle, h1') ?? node.current;
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
    // Only on arrival: a later re-render must not pull focus back to the title.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.inPane && inWorkArea) {
    return (
      <div ref={node} className={classNames('kui-NavigatorScreen', className)}>
        <Page title={title}>{children}</Page>
      </div>
    );
  }
  if (state.inPane) {
    // A side pane keeps its title in its band: a page's large title would dwarf a narrow
    // inspector's rows. The screen claims the pane's title, collapsed from the start.
    return (
      <div ref={node} className={classNames('kui-NavigatorScreen', className)}>
        <SidePaneTitle title={title} />
        {children}
      </div>
    );
  }

  const heading = (
    <Heading as="h2" size="4" weight="medium" truncate>
      {title}
    </Heading>
  );
  return (
    <div ref={node} className={classNames('kui-NavigatorScreen', className)}>
      {/* One row: Back, the title, and the overlay's close. The band sits one step closer to the
          panel's edge than the content does. */}
      <div className="kui-NavigatorBar">
        <Toolbar aria-label="Navigation">
          {state.canGoBack && depth > 0 ? (
            <ToolbarButton iconOnly aria-label={backLabel(state, depth)} onClick={state.pop}>
              <BackGlyph />
            </ToolbarButton>
          ) : null}
          <ToolbarTitle className="kui-NavigatorBarTitle">{Host ? <Host.Title>{heading}</Host.Title> : heading}</ToolbarTitle>
          {Host ? (
            <Host.Close>
              <ToolbarButton iconOnly aria-label="Close">
                <CloseGlyph />
              </ToolbarButton>
            </Host.Close>
          ) : null}
        </Toolbar>
      </div>
      <div className="kui-NavigatorBody">{children}</div>
    </div>
  );
}

function SidePaneTitle({ title }: { title: string }) {
  const store = usePageScope();
  useClaimPage(store, title);
  React.useEffect(() => {
    if (!store) return;
    setPageCollapsed(store, true);
    return () => setPageCollapsed(store, false);
  }, [store]);
  return null;
}

interface NavigatorLinkProps<T> extends Omit<React.ComponentPropsWithoutRef<'button'>, 'value' | 'onClick'> {
  /** The value pushed onto the path when the row is pressed. */
  value: T;
}

/** A row that opens the next screen, with the chevron that says so. */
function NavigatorLink<T>({ value, className, children, ...props }: NavigatorLinkProps<T>) {
  const state = useNavigatorState();
  return (
    <button type="button" {...props} className={classNames('kui-reset', 'kui-NavigatorLink', className)} onClick={() => state.push(value)}>
      <span className="kui-NavigatorLinkLabel">{children}</span>
      <svg className="kui-NavigatorLinkGlyph" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export { Navigator, NavigatorOutlet, NavigatorBack, NavigatorTitle, NavigatorScreen, NavigatorLink, useNavigator };
export type { NavigatorProps, NavigatorBackProps, NavigatorScreenProps, NavigatorLinkProps, NavigatorApi };
