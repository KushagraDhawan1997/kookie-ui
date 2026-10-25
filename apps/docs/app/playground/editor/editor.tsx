'use client';

import * as React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Edges, Grid, OrbitControls, Text as SceneText } from '@react-three/drei';
import { Box, Button, DropdownMenu, Flex, Popover, Shell, TextField, Theme, Toolbar, ToolbarButton, ToolbarGroup } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiMagicIcon,
  CenterFocusIcon,
  CircleIcon,
  Cone01Icon,
  CubeIcon,
  Cylinder01Icon,
  DonutIcon,
  MinusSignIcon,
  PlusSignIcon,
  PyramidIcon,
  Redo02Icon,
  TextIcon,
  Undo02Icon,
} from '@hugeicons/core-free-icons';

const ZOOM_STEP = 1.25;
const MIN_DISTANCE = 1.5;
const MAX_DISTANCE = 60;

type Kind = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'torus' | 'text';
type SceneObject = { id: number; kind: Kind; position: [number, number, number] };

const PRIMITIVES: { kind: Kind; label: string; icon: typeof CubeIcon }[] = [
  { kind: 'cube', label: 'Cube', icon: CubeIcon },
  { kind: 'sphere', label: 'Sphere', icon: CircleIcon },
  { kind: 'cylinder', label: 'Cylinder', icon: Cylinder01Icon },
  { kind: 'cone', label: 'Cone', icon: Cone01Icon },
  { kind: 'pyramid', label: 'Pyramid', icon: PyramidIcon },
  { kind: 'torus', label: 'Torus', icon: DonutIcon },
  { kind: 'text', label: 'Text', icon: TextIcon },
];

function Geometry({ kind }: { kind: Exclude<Kind, 'text'> }) {
  switch (kind) {
    case 'cube':
      return <boxGeometry args={[1, 1, 1]} />;
    case 'sphere':
      return <sphereGeometry args={[0.6, 32, 16]} />;
    case 'cylinder':
      return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
    case 'cone':
      return <coneGeometry args={[0.55, 1, 32]} />;
    case 'pyramid':
      return <coneGeometry args={[0.65, 1, 4]} />;
    case 'torus':
      return <torusGeometry args={[0.45, 0.18, 16, 48]} />;
  }
}

/** History as a list of scenes, so undo and redo are one index move each. */
function useHistory() {
  const [state, setState] = React.useState({ stack: [[]] as SceneObject[][], index: 0 });
  const objects = state.stack[state.index];
  const commit = (next: SceneObject[]) => setState((s) => ({ stack: [...s.stack.slice(0, s.index + 1), next], index: s.index + 1 }));
  return {
    objects,
    commit,
    canUndo: state.index > 0,
    canRedo: state.index < state.stack.length - 1,
    undo: () => setState((s) => ({ ...s, index: Math.max(0, s.index - 1) })),
    redo: () => setState((s) => ({ ...s, index: Math.min(s.stack.length - 1, s.index + 1) })),
  };
}

/**
 * Step 2 of the phone-first editor: adding objects.
 *
 * The bottom bar is for making things (Add, Make with AI); the camera moved to a small cluster on
 * the canvas edge, like map zoom buttons, so two bars never stack at the bottom. Undo and redo sit
 * in the header. Add is a menu that opens upward from the bar and never resizes the canvas; picking
 * a shape drops it at the centre of the view, selected. Gestures stay shortcuts: every camera move
 * has a button.
 */
export function Editor() {
  const controls = React.useRef<React.ComponentRef<typeof OrbitControls> | null>(null);
  const history = useHistory();
  const [selected, setSelected] = React.useState<number | null>(null);
  const nextId = React.useRef(1);
  // Draw every frame while the scene loads (shaders compile, the canvas settles its size), then
  // only on demand, so an idle editor costs no frames.
  const [frameloop, setFrameloop] = React.useState<'always' | 'demand'>('always');
  React.useEffect(() => {
    const t = window.setTimeout(() => setFrameloop('demand'), 1500);
    return () => window.clearTimeout(t);
  }, []);

  const zoom = React.useCallback((factor: number) => {
    const c = controls.current;
    if (!c) return;
    const offset = c.object.position.clone().sub(c.target);
    offset.setLength(Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, offset.length() * factor)));
    c.object.position.copy(c.target).add(offset);
    c.update();
  }, []);

  const fit = React.useCallback(() => controls.current?.reset(), []);

  const add = (kind: Kind) => {
    const target = controls.current?.target;
    const id = nextId.current++;
    // Drop it where the view is looking, resting on the ground.
    const position: [number, number, number] = [target?.x ?? 0, 0.5, target?.z ?? 0];
    history.commit([...history.objects, { id, kind, position }]);
    setSelected(id);
  };

  return (
    // Size 3 on a phone until v2's responsive sizing reaches v1.
    <Theme size="3" asChild>
      <Shell.Root height="100dvh">
        <Shell.Content>
          {/* The canvas owns every touch on it: no page scroll, no page pinch, no double-tap zoom. */}
          <Box position="absolute" inset="0" style={{ touchAction: 'none', background: 'var(--color-ground)' }}>
            <Canvas frameloop={frameloop} dpr={[1, 2]} camera={{ position: [6, 5, 8], fov: 45, near: 0.1, far: 200 }} gl={{ antialias: true, alpha: true }} onPointerMissed={() => setSelected(null)}>
              <RedrawOnResize />
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 10, 5]} intensity={0.9} />
              <Grid infiniteGrid cellSize={0.5} sectionSize={2.5} cellThickness={0.6} sectionThickness={1} cellColor="#a8a8a8" sectionColor="#8a8a8a" fadeDistance={40} fadeStrength={1.5} />
              {history.objects.map((o) => {
                const isSelected = o.id === selected;
                const select = (e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  setSelected(o.id);
                };
                return o.kind === 'text' ? (
                  <SceneText key={o.id} position={o.position} fontSize={0.8} anchorX="center" anchorY="middle" color={isSelected ? '#3d5afe' : '#3a3a3a'} onClick={select}>
                    Text
                  </SceneText>
                ) : (
                  <mesh key={o.id} position={o.position} onClick={select}>
                    <Geometry kind={o.kind} />
                    <meshStandardMaterial color={isSelected ? '#9aa7ff' : '#d4d4d4'} roughness={0.6} />
                    {isSelected ? <Edges color="#3d5afe" /> : null}
                  </mesh>
                );
              })}
              <OrbitControls ref={controls} makeDefault enableDamping={false} minDistance={MIN_DISTANCE} maxDistance={MAX_DISTANCE} />
            </Canvas>
          </Box>

          {/* Header: history. */}
          <Shell.PaneHeader float>
            <Toolbar aria-label="History" backdrop size="3">
              <ToolbarGroup>
                <ToolbarButton iconOnly aria-label="Undo" disabled={!history.canUndo} onClick={history.undo}>
                  <HugeiconsIcon icon={Undo02Icon} strokeWidth={1.75} />
                </ToolbarButton>
                <ToolbarButton iconOnly aria-label="Redo" disabled={!history.canRedo} onClick={history.redo}>
                  <HugeiconsIcon icon={Redo02Icon} strokeWidth={1.75} />
                </ToolbarButton>
              </ToolbarGroup>
            </Toolbar>
          </Shell.PaneHeader>

          {/* Camera: a small cluster on the canvas edge, like map zoom buttons. */}
          <Box position="absolute" right="0" top="50%" style={{ transform: 'translateY(-50%)', paddingRight: 'calc(env(safe-area-inset-right) + 12px)' }}>
            <Toolbar aria-label="View" orientation="vertical" backdrop size="3">
              <ToolbarGroup>
                <ToolbarButton iconOnly aria-label="Zoom in" onClick={() => zoom(1 / ZOOM_STEP)}>
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.75} />
                </ToolbarButton>
                <ToolbarButton iconOnly aria-label="Zoom out" onClick={() => zoom(ZOOM_STEP)}>
                  <HugeiconsIcon icon={MinusSignIcon} strokeWidth={1.75} />
                </ToolbarButton>
                <ToolbarButton iconOnly aria-label="Fit view" onClick={fit}>
                  <HugeiconsIcon icon={CenterFocusIcon} strokeWidth={1.75} />
                </ToolbarButton>
              </ToolbarGroup>
            </Toolbar>
          </Box>

          {/* Footer: making things. */}
          <Shell.PaneFooter float style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
            <Toolbar aria-label="Create" backdrop size="3" style={{ justifyContent: 'center' }}>
              <ToolbarGroup>
                <AddMenu onAdd={add} />
                <MakeWithAi onMake={add} />
              </ToolbarGroup>
            </Toolbar>
          </Shell.PaneFooter>
        </Shell.Content>
      </Shell.Root>
    </Theme>
  );
}

/**
 * With an on-demand frame loop, a frame drawn before the canvas has its final size stays blank
 * until something else asks for one. Draw again whenever the size changes.
 */
function RedrawOnResize() {
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);
  React.useEffect(() => {
    invalidate();
  }, [width, height, invalidate]);
  return null;
}

/**
 * Add, as a menu: a few commands float over the canvas and close on a pick, so nothing resizes.
 *
 * Radix opens a menu on pointerdown. On a phone the tap's own focus lands on the button after the
 * menu has opened, which a non-modal menu reads as focus leaving it, and it closes at once. A touch
 * opens it on click instead, once the tap is over; a mouse and the keyboard keep Radix's behaviour.
 */
function AddMenu({ onAdd }: { onAdd: (kind: Kind) => void }) {
  const [open, setOpen] = React.useState(false);
  const touch = React.useRef(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenu.Trigger
        onPointerDown={(e) => {
          touch.current = e.pointerType !== 'mouse';
          if (touch.current) e.preventDefault();
        }}
        onClick={() => {
          if (touch.current) setOpen((o) => !o);
          touch.current = false;
        }}
      >
        {/* "+" is a settled symbol, so it goes icon-only; the name stays for screen readers. */}
        <ToolbarButton iconOnly aria-label="Add">
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.75} />
        </ToolbarButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="top" align="start" sideOffset={8}>
        {PRIMITIVES.map((p) => (
          <DropdownMenu.Item key={p.kind} onSelect={() => onAdd(p.kind)}>
            <HugeiconsIcon icon={p.icon} strokeWidth={1.75} />
            {p.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

/** Make with AI, mocked: describe a shape, and a matching primitive appears after a moment. */
function MakeWithAi({ onMake }: { onMake: (kind: Kind) => void }) {
  const [open, setOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const make = () => {
    setBusy(true);
    window.setTimeout(() => {
      const words = prompt.toLowerCase();
      const match = PRIMITIVES.find((p) => words.includes(p.kind) || words.includes(p.label.toLowerCase()));
      onMake(match?.kind ?? 'cube');
      setBusy(false);
      setPrompt('');
      setOpen(false);
    }, 900);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <ToolbarButton>
          {/* The sparkle's meaning isn't settled, so it keeps a short label. */}
          <HugeiconsIcon icon={AiMagicIcon} strokeWidth={1.75} />
          Ask AI
        </ToolbarButton>
      </Popover.Trigger>
      <Popover.Content side="top" width="300px">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (prompt.trim()) make();
          }}
        >
          <Flex direction="column" gap="3">
            <TextField.Root aria-label="Describe a shape" placeholder="A tall cylinder…" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={busy} />
            <Button type="submit" emphasis="loud" loading={busy} disabled={!prompt.trim()}>
              Make it
            </Button>
          </Flex>
        </form>
      </Popover.Content>
    </Popover.Root>
  );
}
