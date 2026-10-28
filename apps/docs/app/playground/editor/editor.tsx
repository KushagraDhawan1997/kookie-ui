'use client';

import * as React from 'react';
import { Canvas, useThree, type RootState } from '@react-three/fiber';
import { Grid, Line, OrbitControls, Text as SceneText } from '@react-three/drei';
import { MathUtils, type Object3D, type PerspectiveCamera } from 'three';
import { Box, Button, DropdownMenu, Flex, SegmentedControl, Shell, Text, TextField, Theme, Toolbar, ToolbarButton, ToolbarGroup } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowUpBigIcon,
  PaintBrush04Icon,
  PaletteIcon,
  Copy01Icon,
  GroupLayersIcon,
  SquareLock02Icon,
  SquareUnlock01Icon,
  MoreHorizontalIcon,
  UngroupLayersIcon,
  MoveIcon,
  CenterFocusIcon,
  CircleIcon,
  Cone01Icon,
  CubeIcon,
  Cylinder01Icon,
  Delete02Icon,
  DonutIcon,
  MinusSignIcon,
  PlusSignIcon,
  PyramidIcon,
  Redo02Icon,
  Rotate360Icon,
  TextIcon,
  Tick02Icon,
  Undo02Icon,
} from '@hugeicons/core-free-icons';
import { Handles, SelectionBox } from './handles';
import { MaterialsPane, PaneInset, RoomLight, materialById, materialProps, type PaneRest } from './materials';
import { AXES, MM_PER_UNIT, pick, type Axis, type Mode } from './transform';
import { useTransformGestures, type DragKind, type DragResult } from './use-transform-gestures';

const ZOOM_STEP = 1.25;
const MIN_DISTANCE = 1.5;
const MAX_DISTANCE = 60;
const READOUT_EDGE = 96;

type Kind = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'torus' | 'text' | 'stroke';
type Vec3 = [number, number, number];
/** `group` ties objects together: a tap on one selects them all. */
type SceneObject = { id: number; kind: Kind; position: Vec3; rotation: Vec3; scale: Vec3; group?: number; points?: Vec3[]; material?: string };

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
  // Two modes: arrows move and corner cubes scale in one, rings rotate in the other.
  { mode: 'move', label: 'Move and scale', icon: MoveIcon },
  { mode: 'rotate', label: 'Rotate', icon: Rotate360Icon },
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

function Geometry({ kind }: { kind: Exclude<Kind, 'text' | 'stroke'> }) {
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
 * Step 4 of the phone-first editor: selecting several objects, in persistent regions.
 *
 * Undo and redo sit top left and + bottom left, always. A selection adds its
 * actions top right and the two transform modes bottom right, and takes nothing away. The camera
 * cluster on the edge holds zoom and fit, then Lock view, which stops one-finger orbit, and Shift.
 *
 * A tap selects an object, or its whole group. Shift, on the edge under Lock view, latches on: taps add
 * and remove, a one-finger drag on empty space draws a selection box, and on a handle it
 * constrains (proportions locked, rotation in 15° steps). A long press opens a menu for the object
 * under the finger. Several objects move, turn and scale as one unit around their shared centre,
 * and each drag is one undo step. Two fingers are always the camera.
 */
export function Editor() {
  const controls = React.useRef<React.ComponentRef<typeof OrbitControls> | null>(null);
  const surface = React.useRef<HTMLDivElement>(null);
  const three = React.useRef<(() => RootState) | null>(null);
  const registry = React.useRef(new Map<number, Object3D>());
  const readout = React.useRef<HTMLDivElement>(null);
  const readoutText = React.useRef<HTMLSpanElement>(null);
  const boxOverlay = React.useRef<HTMLDivElement>(null);
  const history = useHistory();
  const [selected, setSelected] = React.useState<number[]>([]);
  const [mode, setMode] = React.useState<Mode>('move');
  const [snap, setSnap] = React.useState(true);
  const [shift, setShift] = React.useState(false);
  // Lock view stops one-finger orbit, so a finger on the canvas can only select or transform.
  const [viewLocked, setViewLocked] = React.useState(false);
  // Draw, latched: one finger draws in 3D. A stub for now: strokes lie on the ground.
  const [drawing, setDrawing] = React.useState(false);
  // The one pane open at a time, Materials for now, and the space it covers over the canvas.
  const [materialsRest, setMaterialsRest] = React.useState<PaneRest>('closed');
  const [covered, setCovered] = React.useState({ bottom: 0, right: 0 });
  const bottomRowRef = React.useRef<HTMLDivElement>(null);
  const [bottomOffset, setBottomOffset] = React.useState(0);
  const [docked, setDocked] = React.useState(false);
  React.useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)');
    const read = () => {
      setDocked(wide.matches);
      const row = bottomRowRef.current?.getBoundingClientRect();
      const area = surface.current?.getBoundingClientRect();
      // The pane sits above the bottom row, which stays usable while it is open.
      if (row && area) setBottomOffset(Math.round(area.bottom - row.top + 8));
    };
    read();
    wide.addEventListener('change', read);
    window.addEventListener('resize', read);
    return () => {
      wide.removeEventListener('change', read);
      window.removeEventListener('resize', read);
    };
  }, [materialsRest]);
  const [liveStroke, setLiveStroke] = React.useState<Vec3[] | null>(null);
  const [dragging, setDragging] = React.useState<DragKind | null>(null);
  const [result, setResult] = React.useState<DragResult | null>(null);
  const [editing, setEditing] = React.useState<{ mode: Mode; axis: Axis } | null>(null);
  const [menu, setMenu] = React.useState<{ id: number | null; x: number; y: number } | null>(null);
  const nextId = React.useRef(1);
  const nextGroup = React.useRef(1);
  // Draw every frame while the scene loads (shaders compile, the canvas settles its size), then
  // only on demand, so an idle editor costs no frames.
  const [frameloop, setFrameloop] = React.useState<'always' | 'demand'>('always');
  React.useEffect(() => {
    const t = window.setTimeout(() => setFrameloop('demand'), 1500);
    return () => window.clearTimeout(t);
  }, []);

  // The readout centres on the finger, but never past the screen's edge.
  const keepOnScreen = (x: number) => Math.min(Math.max(x, READOUT_EDGE), (surface.current?.clientWidth ?? 0) - READOUT_EDGE);

  // Undo can take objects away, so the selection is whatever of it still exists.
  const chosen = history.objects.filter((o) => selected.includes(o.id));
  const single = chosen.length === 1 ? chosen[0] : null;

  /** An object's whole group, or the object alone. */
  const withGroup = (ids: number[]) => {
    const groups = new Set(history.objects.filter((o) => ids.includes(o.id) && o.group).map((o) => o.group));
    return history.objects.filter((o) => ids.includes(o.id) || (o.group && groups.has(o.group))).map((o) => o.id);
  };

  const select = (ids: number[]) => {
    setSelected(ids);
    setResult(null);
    setEditing(null);
  };

  const toggle = (id: number) => {
    const ids = withGroup([id]);
    select(selected.includes(id) ? selected.filter((s) => !ids.includes(s)) : [...new Set([...selected, ...ids])]);
  };

  const commitChanges = (changes: Map<number, Partial<SceneObject>>) => history.commit(history.objects.map((o) => (changes.has(o.id) ? { ...o, ...changes.get(o.id) } : o)));
  const change = (id: number, next: Partial<SceneObject>) => commitChanges(new Map([[id, next]]));

  useTransformGestures({
    surface,
    three,
    box: boxOverlay,
    selection: () => chosen.flatMap((o) => (registry.current.has(o.id) ? [{ id: o.id, object: registry.current.get(o.id)! }] : [])),
    scene: () => history.objects.flatMap((o) => (registry.current.has(o.id) ? [{ id: o.id, object: registry.current.get(o.id)! }] : [])),
    mode,
    snap,
    shift,
    onStart: (kind) => {
      setResult(null);
      setEditing(null);
      setDragging(kind);
    },
    onMove: (text, x, y) => {
      if (readoutText.current) readoutText.current.textContent = text;
      if (readout.current) {
        readout.current.style.left = `${keepOnScreen(x)}px`;
        readout.current.style.top = `${y}px`;
      }
    },
    onCommit: (drag) => {
      const changes = new Map<number, Partial<SceneObject>>();
      for (const o of chosen) {
        const object = registry.current.get(o.id);
        if (!object) continue;
        changes.set(o.id, {
          position: object.position.toArray() as Vec3,
          rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
          scale: object.scale.toArray() as Vec3,
        });
      }
      commitChanges(changes);
      setDragging(null);
      setResult({ ...drag, x: keepOnScreen(drag.x) });
    },
    onCancel: () => setDragging(null),
    onToggle: (id) => {
      if (id !== null) toggle(id);
    },
    // A tap selects what it lands on, or its whole group; a tap on empty space clears the selection.
    onSelect: (id) => select(id === null ? [] : selected.includes(id) ? selected : withGroup([id])),
    onBox: (ids) => {
      setDragging(null);
      select([...new Set([...selected, ...withGroup(ids)])]);
    },
    onLongPress: (id, x, y) => setMenu({ id, x, y }),
    drawing,
    onStrokeMove: (points) => setLiveStroke(points),
    onStroke: (points) => {
      setLiveStroke(null);
      if (points.length < 2) return;
      history.commit([...history.objects, { id: nextId.current++, kind: 'stroke', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], points }]);
    },
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
    select([id]);
  };

  const remove = (ids: number[]) => {
    history.commit(history.objects.filter((o) => !ids.includes(o.id)));
    select(selected.filter((s) => !ids.includes(s)));
  };

  /** Copies sit a little off the originals and become the selection; a copied group stays a group. */
  const duplicate = (ids: number[]) => {
    const groups = new Map<number, number>();
    const copies = history.objects
      .filter((o) => ids.includes(o.id))
      .map((o) => {
        if (o.group && !groups.has(o.group)) groups.set(o.group, nextGroup.current++);
        const position: Vec3 = [o.position[0] + 0.3, o.position[1], o.position[2] + 0.3];
        return { ...o, id: nextId.current++, position, group: o.group ? groups.get(o.group) : undefined };
      });
    history.commit([...history.objects, ...copies]);
    select(copies.map((c) => c.id));
  };

  // One group exactly: the action ungroups it. Anything else: the action groups it.
  const groupIds = new Set(chosen.map((o) => o.group));
  const isOneGroup = chosen.length > 1 && groupIds.size === 1 && !groupIds.has(undefined);
  const toggleGroup = () => {
    const group = isOneGroup ? undefined : nextGroup.current++;
    commitChanges(new Map(chosen.map((o) => [o.id, { group }])));
  };

  const selectAll = () => select(history.objects.map((o) => o.id));
  const selectSimilar = () => {
    const kinds = new Set(chosen.map((o) => o.kind));
    select(history.objects.filter((o) => kinds.has(o.kind)).map((o) => o.id));
  };

  const step = (direction: number) => {
    if (!single || !editing) return;
    const field = FIELDS[editing.mode];
    const i = AXES.indexOf(editing.axis);
    const value = Math.round((field.read(single, i) + direction * field.step) * 100) / 100;
    change(single.id, field.write(single, i, value));
  };

  // Regions. Persistent commands keep their place; context adds a layer and never takes one away.
  //   Top left, persistent: undo and redo.
  //   Top right, only with a selection: what to do with it.
  //   Above the bottom row, one pane at a time (Materials), floating over the canvas, which never
  //   resizes; the camera keeps the scene centred in what the pane leaves visible.
  //   Bottom, one row: +, Draw and Materials on the left, always; Move and scale, Rotate on the right
  //   with a selection. The exact-value steppers float above it while they are open.
  //   Right edge: the camera cluster, then Lock view and Shift.
  let stepper: React.ReactNode = null;
  if (single && editing) {
    const field = FIELDS[editing.mode];
    const i = AXES.indexOf(editing.axis);
    const value = field.read(single, i);
    stepper = (
      <Toolbar aria-label="Exact value" backdrop>
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
            onCommit={(v) => change(single.id, field.write(single, i, v))}
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
  }

  const selectionActions =
    chosen.length > 0 ? (
      <Toolbar aria-label="Selection" backdrop>
        <ToolbarGroup>
          <ToolbarButton iconOnly aria-label="Duplicate" onClick={() => duplicate(selected)}>
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Delete" onClick={() => remove(selected)}>
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.75} />
          </ToolbarButton>
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger>
              <ToolbarButton iconOnly aria-label="More">
                <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
              </ToolbarButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content side="bottom" align="end" sideOffset={8}>
              <DropdownMenu.Item disabled={chosen.length < 2} onSelect={toggleGroup}>
                <HugeiconsIcon icon={isOneGroup ? UngroupLayersIcon : GroupLayersIcon} strokeWidth={1.75} />
                {isOneGroup ? 'Ungroup' : 'Group'}
              </DropdownMenu.Item>
              <DropdownMenu.CheckboxItem checked={snap} onCheckedChange={setSnap}>
                Snap to grid
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.Separator />
              <DropdownMenu.Item onSelect={selectAll}>Select all</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={selectSimilar}>Select similar</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <ToolbarButton iconOnly aria-label="Done" onClick={() => select([])}>
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={1.75} />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
    ) : null;

  // A tap on a material applies it to the selection: one undo step.
  const applyMaterial = (material: string) => {
    if (chosen.length === 0) return;
    commitChanges(new Map(chosen.map((o) => [o.id, { material }])));
  };
  // A material dropped on the canvas applies to the object under it, selected or not.
  const dropMaterial = (material: string, clientX: number, clientY: number) => {
    const area = surface.current?.getBoundingClientRect();
    const cam = three.current?.().camera;
    if (!area || !cam) return;
    const scene = history.objects.flatMap((o) => (registry.current.has(o.id) ? [{ id: o.id, object: registry.current.get(o.id)! }] : []));
    const index = pick(
      clientX - area.left,
      clientY - area.top,
      scene.map((e) => e.object),
      cam as PerspectiveCamera,
      { width: area.width, height: area.height },
    );
    if (index >= 0) change(scene[index].id, { material });
  };

  const constrains = dragging === 'handle' && shift;
  const bottomRow = (
    <Flex ref={bottomRowRef} align="center" justify="between" gap="2" width="100%">
      <Toolbar aria-label="Create" backdrop>
        <ToolbarGroup>
          <AddMenu onAdd={add} />
          {/* Draw latches, like Shift: on until tapped again, and solid while on, since it has no label
              to say so. Turning it on puts the selection down. */}
          <ToolbarButton
            iconOnly
            aria-label="Draw"
            aria-pressed={drawing}
            variant={drawing ? 'solid' : undefined}
            onClick={() => {
              if (!drawing) select([]);
              setDrawing((d) => !d);
            }}
          >
            <HugeiconsIcon icon={PaintBrush04Icon} strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton
            iconOnly
            aria-label="Materials"
            aria-pressed={materialsRest !== 'closed'}
            variant={materialsRest !== 'closed' ? 'solid' : undefined}
            onClick={() => setMaterialsRest((r) => (r === 'closed' ? 'peek' : 'closed'))}
          >
            <HugeiconsIcon icon={PaletteIcon} strokeWidth={1.75} />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
      {chosen.length > 0 ? (
        <Toolbar aria-label="Transform" backdrop>
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
        </Toolbar>
      ) : null}
    </Flex>
  );

  const menuTarget = menu?.id ?? null;
  const menuSelected = menuTarget !== null && selected.includes(menuTarget);

  return (
    // Size 4 on a phone until v2's responsive sizing reaches v1.
    <Theme size="4" asChild>
      <Shell.Root height="100dvh">
        <Shell.Content>
          {/* The canvas owns every touch on it: no page scroll, no page pinch, no double-tap zoom. */}
          <Box ref={surface} position="absolute" inset="0" style={{ touchAction: 'none', background: 'var(--color-ground)', WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}>
            <Canvas
              frameloop={frameloop}
              dpr={[1, 2]}
              camera={{ position: [6, 5, 8], fov: 45, near: 0.1, far: 200 }}
              gl={{ antialias: true, alpha: true }}
              onCreated={(state) => {
                three.current = state.get;
              }}
              onPointerMissed={() => select([])}
            >
              <RedrawOnResize />
              <PaneInset bottom={covered.bottom} right={covered.right} />
              <RoomLight />
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 10, 5]} intensity={0.9} />
              <Grid infiniteGrid cellSize={0.5} sectionSize={2.5} cellThickness={0.6} sectionThickness={1} cellColor="#a8a8a8" sectionColor="#8a8a8a" fadeDistance={40} fadeStrength={1.5} />
              {history.objects.map((o) => {
                const register = (object: Object3D | null) => {
                  if (object) registry.current.set(o.id, object);
                  else registry.current.delete(o.id);
                };
                // A plain tap selects the object, or its whole group, in place of the selection.
                const pickThis = (e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  if (!selected.includes(o.id)) select(withGroup([o.id]));
                };
                const transform = { position: o.position, rotation: o.rotation, scale: o.scale };
                if (o.kind === 'stroke') {
                  return <Line key={o.id} ref={register} {...transform} points={o.points ?? []} color="#d4d4d4" lineWidth={3} />;
                }
                return o.kind === 'text' ? (
                  <SceneText key={o.id} ref={register} {...transform} fontSize={0.8} anchorX="center" anchorY="middle" color="#3a3a3a" onClick={pickThis}>
                    Text
                  </SceneText>
                ) : (
                  <mesh key={o.id} ref={register} {...transform} onClick={pickThis}>
                    <Geometry kind={o.kind} />
                    <meshStandardMaterial {...materialProps(materialById(o.material))} />
                  </mesh>
                );
              })}
              {chosen.map((o) => (
                <SelectionBox key={`box-${o.id}`} target={() => registry.current.get(o.id)} />
              ))}
              {chosen.length > 0 ? <Handles key={selected.join(',')} targets={() => chosen.flatMap((o) => registry.current.get(o.id) ?? [])} mode={mode} /> : null}
              {liveStroke && liveStroke.length > 1 ? <Line points={liveStroke} color="#3d5afe" lineWidth={3} /> : null}
              <OrbitControls ref={controls} makeDefault enableRotate={!viewLocked} enableDamping={false} minDistance={MIN_DISTANCE} maxDistance={MAX_DISTANCE} />
            </Canvas>

            {/* The selection box while Shift drags on empty space. Drawn without a React render. */}
            <Box
              ref={boxOverlay}
              position="absolute"
              style={{ display: 'none', pointerEvents: 'none', border: '1.5px solid #3d5afe', background: 'color-mix(in srgb, #3d5afe 12%, transparent)', borderRadius: 4 }}
            />

            {/* The readout rides above the finger while it drags; after, a tap on it opens the steppers. */}
            {dragging === 'object' || dragging === 'handle' ? (
              <Box ref={readout} position="absolute" style={{ transform: 'translate(-50%, calc(-100% - 48px))', pointerEvents: 'none' }}>
                <Box px="3" py="2" style={{ background: 'var(--color-panel-solid)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--floating-chrome)', whiteSpace: 'nowrap' }}>
                  <Text size="2" weight="medium">
                    <span ref={readoutText} />
                  </Text>
                </Box>
              </Box>
            ) : result && chosen.length > 0 && !editing ? (
              <Box position="absolute" left={`${result.x}px`} top={`${result.y}px`} style={{ transform: 'translate(-50%, calc(-100% - 48px))' }}>
                <Button
                  size="2"
                  variant="soft"
                  color="gray"
                  style={{ whiteSpace: 'nowrap' }}
                  // Exact values are per object, so the readout opens them only for one.
                  disabled={!single}
                  onClick={() => setEditing({ mode: result.mode, axis: result.axis ?? (result.mode === 'rotate' ? 'y' : 'x') })}
                >
                  {result.text}
                </Button>
              </Box>
            ) : null}

            {/* The long-press menu, anchored where the finger pressed. */}
            <DropdownMenu.Root open={menu !== null} onOpenChange={(open) => !open && setMenu(null)} modal={false}>
              <DropdownMenu.Trigger>
                <Box position="absolute" left={`${menu?.x ?? 0}px`} top={`${menu?.y ?? 0}px`} width="0" height="0" style={{ pointerEvents: 'none' }} aria-hidden />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content side="bottom" align="start" sideOffset={12}>
                {menuTarget !== null ? (
                  <>
                    {menuSelected ? (
                      <DropdownMenu.Item onSelect={() => toggle(menuTarget)}>Remove from selection</DropdownMenu.Item>
                    ) : (
                      <>
                        <DropdownMenu.Item onSelect={() => select(withGroup([menuTarget]))}>Select</DropdownMenu.Item>
                        <DropdownMenu.Item onSelect={() => toggle(menuTarget)}>Add to selection</DropdownMenu.Item>
                      </>
                    )}
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onSelect={() => duplicate(withGroup([menuTarget]))}>Duplicate</DropdownMenu.Item>
                    <DropdownMenu.Item color="red" onSelect={() => remove(withGroup([menuTarget]))}>
                      Delete
                    </DropdownMenu.Item>
                  </>
                ) : (
                  <>
                    <DropdownMenu.Item onSelect={selectAll} disabled={history.objects.length === 0}>
                      Select all
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={() => select([])} disabled={chosen.length === 0}>
                      Clear selection
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Box>

          {/* Header: history on the left, always; the selection's actions on the right. */}
          <Shell.PaneHeader float>
            <Flex align="center" justify="between" gap="2" width="100%">
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
              {selectionActions}
            </Flex>
          </Shell.PaneHeader>

          {/* Right edge: the camera, then Lock view, then Shift, each its own pill. Lock view and Shift
              are latched toggles that change what a finger does. */}
          {/* It centres in what an open pane leaves visible, and moves beside a docked one. */}
          <Box
            position="absolute"
            right={`${covered.right}px`}
            // Centred in the space between the header and a bottom pane, or the whole height.
            top={covered.bottom > 0 ? '72px' : '0'}
            bottom={`${covered.bottom}px`}
            style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none', paddingRight: 'calc(env(safe-area-inset-right) + 12px)' }}
          >
            <Flex align="end" gap="2" style={{ pointerEvents: 'auto' }}>
              {/* On, Shift says what it does right now beside it; off, it is only its icon. */}
              {shift ? (
                <Box mb="2" px="3" py="2" style={{ background: 'var(--color-panel-solid)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--floating-chrome)', pointerEvents: 'none' }}>
                  <Text size="2" weight="medium" style={{ whiteSpace: 'nowrap' }}>
                    {constrains ? 'Constrain' : 'Select'}
                  </Text>
                </Box>
              ) : null}
              <Flex direction="column" gap="3">
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
                <Toolbar aria-label="Lock" orientation="vertical" backdrop>
                  <ToolbarGroup>
                    <ToolbarButton iconOnly aria-label="Lock view" aria-pressed={viewLocked} variant={viewLocked ? 'solid' : undefined} onClick={() => setViewLocked((v) => !v)}>
                      <HugeiconsIcon icon={viewLocked ? SquareLock02Icon : SquareUnlock01Icon} strokeWidth={1.75} />
                    </ToolbarButton>
                  </ToolbarGroup>
                </Toolbar>
                <Toolbar aria-label="Shift" orientation="vertical" backdrop>
                  <ToolbarGroup>
                    <ToolbarButton
                      iconOnly
                      aria-label={constrains ? 'Shift: constrain' : 'Shift: select more'}
                      aria-pressed={shift}
                      // On, it fills solid: a mode that changes what every touch does has to be unmissable.
                      variant={shift ? 'solid' : undefined}
                      onClick={() => setShift((s) => !s)}
                    >
                      <HugeiconsIcon icon={ArrowUpBigIcon} strokeWidth={1.75} />
                    </ToolbarButton>
                  </ToolbarGroup>
                </Toolbar>
              </Flex>
            </Flex>
          </Box>

          <MaterialsPane rest={materialsRest} onRestChange={setMaterialsRest} docked={docked} bottomOffset={bottomOffset} onCovered={setCovered} onPick={applyMaterial} onDrop={dropMaterial} />

          {/* Bottom: one row, with the exact-value steppers above it while they are open. */}
          <Shell.PaneFooter float style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
            <Flex direction="column" align="center" gap="2" width="100%">
              {stepper}
              {bottomRow}
            </Flex>
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
