'use client';

import * as React from 'react';
import { Canvas, useThree, type RootState } from '@react-three/fiber';
import { Edges, Grid, OrbitControls, Text as SceneText } from '@react-three/drei';
import { MathUtils, type Object3D } from 'three';
import { Box, Button, DropdownMenu, Flex, Popover, SegmentedControl, Shell, Text, TextField, Theme, Toolbar, ToolbarButton, ToolbarGroup } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiMagicIcon,
  MoveIcon,
  CenterFocusIcon,
  CircleIcon,
  Cone01Icon,
  CubeIcon,
  Cylinder01Icon,
  Delete02Icon,
  DonutIcon,
  MagnetIcon,
  MinusSignIcon,
  PlusSignIcon,
  PyramidIcon,
  Redo02Icon,
  MoveDiagonalIcon,
  Rotate01Icon,
  TextIcon,
  Tick02Icon,
  Undo02Icon,
} from '@hugeicons/core-free-icons';
import { Handles } from './handles';
import { AXES, MM_PER_UNIT, type Axis, type Mode } from './transform';
import { useTransformGestures, type DragResult } from './use-transform-gestures';

const ZOOM_STEP = 1.25;
const MIN_DISTANCE = 1.5;
const MAX_DISTANCE = 60;
const READOUT_EDGE = 96;

type Kind = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'torus' | 'text';
type Vec3 = [number, number, number];
type SceneObject = { id: number; kind: Kind; position: Vec3; rotation: Vec3; scale: Vec3 };

const PRIMITIVES: { kind: Kind; label: string; icon: typeof CubeIcon }[] = [
  { kind: 'cube', label: 'Cube', icon: CubeIcon },
  { kind: 'sphere', label: 'Sphere', icon: CircleIcon },
  { kind: 'cylinder', label: 'Cylinder', icon: Cylinder01Icon },
  { kind: 'cone', label: 'Cone', icon: Cone01Icon },
  { kind: 'pyramid', label: 'Pyramid', icon: PyramidIcon },
  { kind: 'torus', label: 'Torus', icon: DonutIcon },
  { kind: 'text', label: 'Text', icon: TextIcon },
];

const MODES: { mode: Mode; label: string; icon: typeof CubeIcon }[] = [
  { mode: 'move', label: 'Move', icon: MoveIcon },
  { mode: 'rotate', label: 'Rotate', icon: Rotate01Icon },
  { mode: 'scale', label: 'Scale', icon: MoveDiagonalIcon },
];

/** How each mode reads in the stepper: its unit, its step, and the conversion from the scene. */
const FIELDS: Record<Mode, { unit: string; step: number; read(o: SceneObject, i: number): number; write(o: SceneObject, i: number, v: number): Partial<SceneObject> }> = {
  move: {
    unit: 'mm',
    step: 10,
    read: (o, i) => Math.round(o.position[i] * MM_PER_UNIT),
    write: (o, i, v) => ({ position: withAxis(o.position, i, v / MM_PER_UNIT) }),
  },
  rotate: {
    unit: '°',
    step: 15,
    read: (o, i) => Math.round(MathUtils.radToDeg(o.rotation[i])),
    write: (o, i, v) => ({ rotation: withAxis(o.rotation, i, MathUtils.degToRad(v)) }),
  },
  scale: {
    unit: '×',
    step: 0.1,
    read: (o, i) => Math.round(o.scale[i] * 100) / 100,
    write: (o, i, v) => ({ scale: withAxis(o.scale, i, Math.max(0.05, v)) }),
  },
};

function withAxis(v: Vec3, i: number, value: number): Vec3 {
  const next: Vec3 = [...v];
  next[i] = value;
  return next;
}

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
 * Step 3 of the phone-first editor: transforming one object.
 *
 * Selecting an object turns the bottom bar into a selection strip: Move, Rotate or Scale, snapping,
 * Delete and Done. Dragging the object itself does the common thing for the mode (slide on the
 * ground, turn around the vertical, scale evenly); its handles constrain to one axis. A readout
 * rides above the finger, and tapping it after the drag opens steppers for exact values. Two
 * fingers are always the camera. Each drag is one undo step.
 */
export function Editor() {
  const controls = React.useRef<React.ComponentRef<typeof OrbitControls> | null>(null);
  const surface = React.useRef<HTMLDivElement>(null);
  const three = React.useRef<(() => RootState) | null>(null);
  const selectedObject = React.useRef<Object3D | null>(null);
  const readout = React.useRef<HTMLDivElement>(null);
  const readoutText = React.useRef<HTMLSpanElement>(null);
  const history = useHistory();
  const [selected, setSelected] = React.useState<number | null>(null);
  const [mode, setMode] = React.useState<Mode>('move');
  const [snap, setSnap] = React.useState(true);
  const [dragging, setDragging] = React.useState(false);
  const [result, setResult] = React.useState<DragResult | null>(null);
  const [editing, setEditing] = React.useState<{ mode: Mode; axis: Axis } | null>(null);
  const nextId = React.useRef(1);
  // Draw every frame while the scene loads (shaders compile, the canvas settles its size), then
  // only on demand, so an idle editor costs no frames.
  const [frameloop, setFrameloop] = React.useState<'always' | 'demand'>('always');
  React.useEffect(() => {
    const t = window.setTimeout(() => setFrameloop('demand'), 1500);
    return () => window.clearTimeout(t);
  }, []);

  // The readout centres on the finger, but never past the screen's edge.
  const keepOnScreen = (x: number) => Math.min(Math.max(x, READOUT_EDGE), (surface.current?.clientWidth ?? 0) - READOUT_EDGE);

  const current = history.objects.find((o) => o.id === selected) ?? null;

  const select = (id: number | null) => {
    setSelected(id);
    setResult(null);
    setEditing(null);
  };

  const change = (id: number, next: Partial<SceneObject>) => history.commit(history.objects.map((o) => (o.id === id ? { ...o, ...next } : o)));

  useTransformGestures({
    surface,
    three,
    object: selectedObject,
    mode,
    snap,
    onStart: () => {
      setResult(null);
      setEditing(null);
      setDragging(true);
    },
    onMove: (text, x, y) => {
      if (readoutText.current) readoutText.current.textContent = text;
      if (readout.current) {
        readout.current.style.left = `${keepOnScreen(x)}px`;
        readout.current.style.top = `${y}px`;
      }
    },
    onCommit: (drag) => {
      const object = selectedObject.current;
      if (object && current) {
        change(current.id, {
          position: object.position.toArray() as Vec3,
          rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
          scale: object.scale.toArray() as Vec3,
        });
      }
      setDragging(false);
      setResult({ ...drag, x: keepOnScreen(drag.x) });
    },
    onCancel: () => setDragging(false),
  });

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
    const position: Vec3 = [target?.x ?? 0, 0.5, target?.z ?? 0];
    history.commit([...history.objects, { id, kind, position, rotation: [0, 0, 0], scale: [1, 1, 1] }]);
    select(id);
  };

  const remove = () => {
    if (!current) return;
    history.commit(history.objects.filter((o) => o.id !== current.id));
    select(null);
  };

  const step = (direction: number) => {
    if (!current || !editing) return;
    const field = FIELDS[editing.mode];
    const i = AXES.indexOf(editing.axis);
    const value = Math.round((field.read(current, i) + direction * field.step) * 100) / 100;
    change(current.id, field.write(current, i, value));
  };

  let footer: React.ReactNode;
  if (current && editing) {
    const field = FIELDS[editing.mode];
    const i = AXES.indexOf(editing.axis);
    const value = field.read(current, i);
    footer = (
      <Toolbar aria-label="Exact value" backdrop style={{ justifyContent: 'center' }}>
        <ToolbarGroup>
          {/* Tap cycles the axis being edited. */}
          <ToolbarButton aria-label={`Axis ${editing.axis.toUpperCase()}, change axis`} onClick={() => setEditing({ ...editing, axis: AXES[(i + 1) % 3] })}>
            {editing.axis.toUpperCase()}
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label={`Less, by ${field.step} ${field.unit}`} onClick={() => step(-1)}>
            <HugeiconsIcon icon={MinusSignIcon} strokeWidth={1.75} />
          </ToolbarButton>
          <ExactValue
            key={`${editing.mode}-${editing.axis}-${value}`}
            value={value}
            unit={field.unit}
            label={`${MODES.find((m) => m.mode === editing.mode)?.label} ${editing.axis.toUpperCase()}`}
            onCommit={(v) => change(current.id, field.write(current, i, v))}
          />
          <ToolbarButton iconOnly aria-label={`More, by ${field.step} ${field.unit}`} onClick={() => step(1)}>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Done editing" onClick={() => setEditing(null)}>
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={1.75} />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
    );
  } else if (current) {
    footer = (
      <Toolbar aria-label="Selection" backdrop style={{ justifyContent: 'center' }}>
        <SegmentedControl.Root
          aria-label="Transform"
          value={mode}
          onValueChange={(value) => {
            setMode(value as Mode);
            setResult(null);
          }}
        >
          {MODES.map((m) => (
            <SegmentedControl.Item key={m.mode} value={m.mode} aria-label={m.label}>
              <HugeiconsIcon icon={m.icon} strokeWidth={1.75} />
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
        <ToolbarGroup>
          <ToolbarButton iconOnly aria-label="Snap" aria-pressed={snap} onClick={() => setSnap((s) => !s)}>
            <HugeiconsIcon icon={MagnetIcon} strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Delete" onClick={remove}>
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Done" onClick={() => select(null)}>
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={1.75} />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
    );
  } else {
    footer = (
      <Toolbar aria-label="Create" backdrop style={{ justifyContent: 'center' }}>
        <ToolbarGroup>
          <AddMenu onAdd={add} />
          <MakeWithAi onMake={add} />
        </ToolbarGroup>
      </Toolbar>
    );
  }

  return (
    // Size 4 on a phone until v2's responsive sizing reaches v1.
    <Theme size="4" asChild>
      <Shell.Root height="100dvh">
        <Shell.Content>
          {/* The canvas owns every touch on it: no page scroll, no page pinch, no double-tap zoom. */}
          <Box ref={surface} position="absolute" inset="0" style={{ touchAction: 'none', background: 'var(--color-ground)' }}>
            <Canvas
              frameloop={frameloop}
              dpr={[1, 2]}
              camera={{ position: [6, 5, 8], fov: 45, near: 0.1, far: 200 }}
              gl={{ antialias: true, alpha: true }}
              onCreated={(state) => {
                three.current = state.get;
              }}
              onPointerMissed={() => select(null)}
            >
              <RedrawOnResize />
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 10, 5]} intensity={0.9} />
              <Grid infiniteGrid cellSize={0.5} sectionSize={2.5} cellThickness={0.6} sectionThickness={1} cellColor="#a8a8a8" sectionColor="#8a8a8a" fadeDistance={40} fadeStrength={1.5} />
              {history.objects.map((o) => {
                const isSelected = o.id === selected;
                const pick = (e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  if (!isSelected) select(o.id);
                };
                const transform = { position: o.position, rotation: o.rotation, scale: o.scale };
                return o.kind === 'text' ? (
                  <SceneText
                    key={o.id}
                    ref={isSelected ? selectedObject : undefined}
                    {...transform}
                    fontSize={0.8}
                    anchorX="center"
                    anchorY="middle"
                    color={isSelected ? '#3d5afe' : '#3a3a3a'}
                    onClick={pick}
                  >
                    Text
                  </SceneText>
                ) : (
                  <mesh key={o.id} ref={isSelected ? selectedObject : undefined} {...transform} onClick={pick}>
                    <Geometry kind={o.kind} />
                    <meshStandardMaterial color={isSelected ? '#9aa7ff' : '#d4d4d4'} roughness={0.6} />
                    {isSelected ? <Edges color="#3d5afe" /> : null}
                  </mesh>
                );
              })}
              {current ? <Handles key={current.id} target={selectedObject} mode={mode} /> : null}
              <OrbitControls ref={controls} makeDefault enableDamping={false} minDistance={MIN_DISTANCE} maxDistance={MAX_DISTANCE} />
            </Canvas>

            {/* The readout rides above the finger while it drags; after, a tap on it opens the steppers. */}
            {dragging ? (
              <Box ref={readout} position="absolute" style={{ transform: 'translate(-50%, calc(-100% - 48px))', pointerEvents: 'none' }}>
                <Box px="3" py="2" style={{ background: 'var(--color-panel-solid)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--floating-chrome)', whiteSpace: 'nowrap' }}>
                  <Text size="2" weight="medium">
                    <span ref={readoutText} />
                  </Text>
                </Box>
              </Box>
            ) : result && current && !editing ? (
              <Box position="absolute" left={`${result.x}px`} top={`${result.y}px`} style={{ transform: 'translate(-50%, calc(-100% - 48px))' }}>
                <Button
                  size="2"
                  variant="soft"
                  color="gray"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => setEditing({ mode: result.mode, axis: result.axis ?? (result.mode === 'rotate' ? 'y' : 'x') })}
                >
                  {result.text}
                </Button>
              </Box>
            ) : null}
          </Box>

          {/* Header: history. */}
          <Shell.PaneHeader float>
            <Toolbar aria-label="History" backdrop>
              <ToolbarGroup>
                <ToolbarButton
                  iconOnly
                  aria-label="Undo"
                  disabled={!history.canUndo}
                  onClick={() => {
                    history.undo();
                    setResult(null);
                  }}
                >
                  <HugeiconsIcon icon={Undo02Icon} strokeWidth={1.75} />
                </ToolbarButton>
                <ToolbarButton
                  iconOnly
                  aria-label="Redo"
                  disabled={!history.canRedo}
                  onClick={() => {
                    history.redo();
                    setResult(null);
                  }}
                >
                  <HugeiconsIcon icon={Redo02Icon} strokeWidth={1.75} />
                </ToolbarButton>
              </ToolbarGroup>
            </Toolbar>
          </Shell.PaneHeader>

          {/* Camera: a small cluster on the canvas edge, like map zoom buttons. */}
          <Box position="absolute" right="0" top="50%" style={{ transform: 'translateY(-50%)', paddingRight: 'calc(env(safe-area-inset-right) + 12px)' }}>
            <Toolbar aria-label="View" orientation="vertical" backdrop>
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

          {/* Footer: making things, or the selection strip while an object is selected. */}
          <Shell.PaneFooter float style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
            {footer}
          </Shell.PaneFooter>
        </Shell.Content>
      </Shell.Root>
    </Theme>
  );
}

/** An exact number, typed. The keyboard opens only here, and the value lands on Enter or on leaving. */
function ExactValue({ value, unit, label, onCommit }: { value: number; unit: string; label: string; onCommit: (value: number) => void }) {
  const [draft, setDraft] = React.useState(String(value));
  const commit = () => {
    const next = Number(draft);
    if (Number.isFinite(next) && next !== value) onCommit(next);
    else setDraft(String(value));
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        commit();
      }}
    >
      <TextField.Root aria-label={label} inputMode="decimal" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} style={{ width: 104 }}>
        <TextField.Slot side="right">{unit}</TextField.Slot>
      </TextField.Root>
    </form>
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
