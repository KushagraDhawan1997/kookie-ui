'use client';

import * as React from 'react';
import { useThree } from '@react-three/fiber';
import { AmbientLight, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator, Scene, SphereGeometry, WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Box, Grid as LayoutGrid, Text } from '@kushagradhawan/kookie-ui';

export type MaterialDef = { id: string; name: string; color: string; roughness: number; metalness: number; emissive?: string; opacity?: number };

export const MATERIALS: MaterialDef[] = [
  { id: 'clay', name: 'Clay', color: '#d4d4d4', roughness: 0.6, metalness: 0 },
  { id: 'chalk', name: 'Chalk', color: '#f4f1ea', roughness: 0.95, metalness: 0 },
  { id: 'plastic-red', name: 'Red plastic', color: '#e5484d', roughness: 0.35, metalness: 0 },
  { id: 'plastic-blue', name: 'Blue plastic', color: '#0090ff', roughness: 0.35, metalness: 0 },
  { id: 'rubber', name: 'Rubber', color: '#2b2b2b', roughness: 0.9, metalness: 0 },
  { id: 'wood', name: 'Wood', color: '#9a6a3c', roughness: 0.7, metalness: 0 },
  { id: 'gold', name: 'Gold', color: '#e8b64c', roughness: 0.25, metalness: 1 },
  { id: 'copper', name: 'Copper', color: '#c9774b', roughness: 0.3, metalness: 1 },
  { id: 'chrome', name: 'Chrome', color: '#e6e8ea', roughness: 0.08, metalness: 1 },
  { id: 'jade', name: 'Jade', color: '#30a46c', roughness: 0.2, metalness: 0.1 },
  { id: 'glass', name: 'Glass', color: '#bfe3ff', roughness: 0.05, metalness: 0, opacity: 0.45 },
  { id: 'neon', name: 'Neon', color: '#ff3d9a', roughness: 0.4, metalness: 0, emissive: '#ff3d9a' },
];

export const materialById = (id: string | undefined) => MATERIALS.find((m) => m.id === id) ?? MATERIALS[0];

/** The props a meshStandardMaterial takes for a material. */
export function materialProps(def: MaterialDef) {
  return {
    color: def.color,
    roughness: def.roughness,
    metalness: def.metalness,
    emissive: def.emissive ?? '#000000',
    emissiveIntensity: def.emissive ? 0.6 : 0,
    transparent: def.opacity !== undefined,
    opacity: def.opacity ?? 1,
  };
}

/**
 * One sphere per material, rendered once to a picture on a single offscreen renderer: a grid of
 * live canvases would be a WebGL context each.
 */
function useThumbnails(size: number) {
  const [thumbs, setThumbs] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    const px = size * Math.min(2, window.devicePixelRatio || 1);
    const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(px, px, false);
    const scene = new Scene();
    // A room to reflect, so metals and glass read as themselves rather than black.
    const pmrem = new PMREMGenerator(renderer);
    const room = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = room.texture;
    scene.environmentIntensity = ENVIRONMENT_INTENSITY;
    scene.add(new AmbientLight('#ffffff', 0.6));
    const key = new DirectionalLight('#ffffff', 1.4);
    key.position.set(2, 3, 4);
    scene.add(key);
    const camera = new PerspectiveCamera(30, 1, 0.1, 10);
    camera.position.set(0, 0, 3.6);
    const geometry = new SphereGeometry(0.85, 48, 32);
    const material = new MeshStandardMaterial();
    scene.add(new Mesh(geometry, material));
    const next: Record<string, string> = {};
    for (const def of MATERIALS) {
      material.setValues(materialProps(def));
      material.needsUpdate = true;
      renderer.render(scene, camera);
      next[def.id] = renderer.domElement.toDataURL('image/png');
    }
    setThumbs(next);
    geometry.dispose();
    material.dispose();
    room.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }, [size]);
  return thumbs;
}

const ENVIRONMENT_INTENSITY = 0.4;

/** The same room for the editor's scene, so a material looks in the scene as it does in the pane. */
export function RoomLight() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  React.useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = room.texture;
    scene.environmentIntensity = ENVIRONMENT_INTENSITY;
    invalidate();
    return () => {
      scene.environment = null;
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, invalidate]);
  return null;
}

/** Where the pane rests: closed, one row of spheres, or half the screen. */
export type PaneRest = 'closed' | 'peek' | 'half';
const PEEK_PX = 128;
const HANDLE_PX = 24;
const SPHERE_PX = 72;

/**
 * Keeps the scene centred in what the pane leaves visible. The camera's frame slides by half the
 * covered space, at the same scale, so fit and the selection land above the pane (or beside it
 * when docked) and the canvas itself never resizes.
 */
export function PaneInset({ bottom, right }: { bottom: number; right: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const invalidate = useThree((s) => s.invalidate);
  React.useEffect(() => {
    if (bottom > 0 || right > 0) camera.setViewOffset(width, height, right / 2, bottom / 2, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, width, height, bottom, right, invalidate]);
  return null;
}

type PaneProps = {
  rest: PaneRest;
  onRestChange: (rest: PaneRest) => void;
  /** Docked as a side panel on a wide window; a sheet over the bottom of a phone otherwise. */
  docked: boolean;
  /** Space below the pane on a phone: the bottom row it sits above. */
  bottomOffset: number;
  onCovered: (covered: { bottom: number; right: number }) => void;
  /** A tap on a sphere. */
  onPick: (id: string) => void;
  /** A sphere dropped at a point on the screen. */
  onDrop: (id: string, clientX: number, clientY: number) => void;
};

/**
 * Materials, as a non-modal pane over the canvas: no scrim, the scene stays live. On a phone it
 * rises above the bottom row to one of two rests, peek and half, and only its handle resizes it,
 * so the grid scrolls freely; dragging the handle down past peek closes it. On a wide window it
 * docks to the right edge instead.
 */
export function MaterialsPane({ rest, onRestChange, docked, bottomOffset, onCovered, onPick, onDrop }: PaneProps) {
  const thumbs = useThumbnails(SPHERE_PX);
  const [dragHeight, setDragHeight] = React.useState<number | null>(null);
  const [ghost, setGhost] = React.useState<{ id: string; x: number; y: number } | null>(null);
  const handle = React.useRef<{ y0: number; h0: number } | null>(null);
  const sphereDrag = React.useRef<{ id: string; x0: number; y0: number; moved: boolean } | null>(null);

  // Half is half the space above the bottom row, so the camera buttons still fit above the pane.
  const halfPx = typeof window === 'undefined' ? 360 : Math.round((window.innerHeight - bottomOffset) / 2);
  const restHeight = rest === 'half' ? halfPx : rest === 'peek' ? PEEK_PX : 0;
  const height = dragHeight ?? restHeight;
  const open = rest !== 'closed';
  const sideWidth = 280;

  React.useEffect(() => {
    if (!open) onCovered({ bottom: 0, right: 0 });
    else if (docked) onCovered({ bottom: 0, right: sideWidth });
    else onCovered({ bottom: restHeight + bottomOffset, right: 0 });
  }, [open, docked, restHeight, bottomOffset, onCovered]);

  if (!open) return null;

  // A sphere: a tap applies it to the selection; a drag carries it to an object.
  const sphereHandlers = (id: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      sphereDrag.current = { id, x0: e.clientX, y0: e.clientY, moved: false };
      // Keep the pointer, so a drag that leaves the sphere at once still reports here (a touch
      // does this anyway; a mouse does not). A vertical swipe on a touch screen still scrolls.
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = sphereDrag.current;
      if (!d) return;
      if (!d.moved) {
        // A drag mostly up or sideways carries the sphere; mostly down the grid, it scrolls.
        const dx = e.clientX - d.x0;
        const dy = e.clientY - d.y0;
        if (Math.hypot(dx, dy) < 8) return;
        if (!docked && Math.abs(dy) > Math.abs(dx) && dy > 0) {
          sphereDrag.current = null;
          return;
        }
        d.moved = true;
      }
      setGhost({ id, x: e.clientX, y: e.clientY });
    },
    onPointerUp: (e: React.PointerEvent) => {
      const d = sphereDrag.current;
      sphereDrag.current = null;
      setGhost(null);
      if (!d) return;
      if (d.moved) onDrop(id, e.clientX, e.clientY);
      else onPick(id);
    },
    onPointerCancel: () => {
      sphereDrag.current = null;
      setGhost(null);
    },
  });

  const grid = (
    <LayoutGrid columns={docked ? '3' : '4'} gap="3" p="3" style={{ overflowY: 'auto', touchAction: 'pan-y', flex: 1, minHeight: 0 }}>
      {MATERIALS.map((m) => (
        <Box key={m.id} asChild>
          <button
            type="button"
            aria-label={m.name}
            {...sphereHandlers(m.id)}
            style={{ all: 'unset', cursor: 'pointer', display: 'grid', justifyItems: 'center', gap: 4, touchAction: docked ? 'none' : 'pan-y' }}
          >
            {thumbs[m.id] ? <img src={thumbs[m.id]} alt="" width={SPHERE_PX} height={SPHERE_PX} draggable={false} /> : <Box width={`${SPHERE_PX}px`} height={`${SPHERE_PX}px`} />}
            <Text size="1" emphasis="medium">
              {m.name}
            </Text>
          </button>
        </Box>
      ))}
    </LayoutGrid>
  );

  const surface = { background: 'var(--color-panel-solid)', boxShadow: 'var(--floating-chrome)', display: 'flex', flexDirection: 'column' as const };

  return (
    <>
      {docked ? (
        <Box
          position="absolute"
          right="0"
          top="0"
          bottom="0"
          width={`${sideWidth}px`}
          role="region"
          aria-label="Materials"
          style={{ ...surface, borderTopLeftRadius: 'var(--radius-surface-2)', borderBottomLeftRadius: 'var(--radius-surface-2)', paddingTop: 72 }}
        >
          {grid}
        </Box>
      ) : (
        <Box
          position="absolute"
          left="0"
          right="0"
          role="region"
          aria-label="Materials"
          style={{ ...surface, bottom: bottomOffset, height, borderTopLeftRadius: 'var(--radius-surface-2)', borderTopRightRadius: 'var(--radius-surface-2)' }}
        >
          {/* The handle is the only thing that resizes the pane, so the grid below scrolls freely. */}
          <Box
            height={`${HANDLE_PX}px`}
            style={{ display: 'grid', placeItems: 'center', touchAction: 'none', cursor: 'ns-resize', flexShrink: 0 }}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize materials"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') onRestChange('half');
              if (e.key === 'ArrowDown') onRestChange(rest === 'half' ? 'peek' : 'closed');
            }}
            onPointerDown={(e) => {
              handle.current = { y0: e.clientY, h0: height };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              const h = handle.current;
              if (h) setDragHeight(Math.max(0, Math.min(halfPx, h.h0 - (e.clientY - h.y0))));
            }}
            onPointerUp={() => {
              const h = handle.current;
              handle.current = null;
              if (!h || dragHeight === null) return;
              // Settle on the nearest rest; well below peek, it closes.
              const next: PaneRest = dragHeight < PEEK_PX * 0.6 ? 'closed' : dragHeight < (PEEK_PX + halfPx) / 2 ? 'peek' : 'half';
              setDragHeight(null);
              onRestChange(next);
            }}
          >
            <Box width="36px" height="4px" style={{ borderRadius: 2, background: 'var(--gray-a6)' }} />
          </Box>
          {grid}
        </Box>
      )}
      {ghost && thumbs[ghost.id] ? (
        <img src={thumbs[ghost.id]} alt="" width={56} height={56} style={{ position: 'fixed', left: ghost.x, top: ghost.y, transform: 'translate(-50%, -110%)', pointerEvents: 'none', zIndex: 10 }} />
      ) : null}
    </>
  );
}
