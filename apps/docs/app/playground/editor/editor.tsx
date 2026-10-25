'use client';

import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { Box, Shell, Toolbar, ToolbarButton, ToolbarGroup } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { CenterFocusIcon, MinusSignIcon, PlusSignIcon } from '@hugeicons/core-free-icons';

/** How much one press of zoom in or out moves the camera toward or away from its target. */
const ZOOM_STEP = 1.25;
const MIN_DISTANCE = 1.5;
const MAX_DISTANCE = 60;

/**
 * Step 1 of the phone-first editor: an empty scene.
 *
 * Gestures are shortcuts, visible controls come first (web on Safari can't rely on
 * gestures people have to discover): one finger orbits, two fingers pan, pinch zooms, and the
 * bar at the bottom zooms and fits the view with plain buttons.
 */
export function Editor() {
  const controls = React.useRef<React.ComponentRef<typeof OrbitControls> | null>(null);

  const zoom = React.useCallback((factor: number) => {
    const c = controls.current;
    if (!c) return;
    const offset = c.object.position.clone().sub(c.target);
    const distance = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, offset.length() * factor));
    offset.setLength(distance);
    c.object.position.copy(c.target).add(offset);
    c.update();
  }, []);

  const fit = React.useCallback(() => controls.current?.reset(), []);

  return (
    <Shell.Root height="100dvh">
      <Shell.Content>
        {/* The canvas owns every touch on it: no page scroll, no page pinch, no double-tap zoom. */}
        <Box position="absolute" inset="0" style={{ touchAction: 'none', background: 'var(--color-ground)' }}>
          <Canvas
            frameloop="demand"
            dpr={[1, 2]}
            camera={{ position: [6, 5, 8], fov: 45, near: 0.1, far: 200 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <Grid
              infiniteGrid
              cellSize={0.5}
              sectionSize={2.5}
              cellThickness={0.6}
              sectionThickness={1}
              cellColor="#a8a8a8"
              sectionColor="#8a8a8a"
              fadeDistance={40}
              fadeStrength={1.5}
            />
            {/* One finger orbits, two fingers pan and pinch. Damping off, so the scene only redraws while a finger moves. */}
            <OrbitControls ref={controls} makeDefault enableDamping={false} minDistance={MIN_DISTANCE} maxDistance={MAX_DISTANCE} />
          </Canvas>
        </Box>

        {/* Visible view controls, clear of the home indicator. */}
        <Box
          position="absolute"
          left="0"
          right="0"
          bottom="0"
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
            pointerEvents: 'none',
          }}
        >
          <Box style={{ pointerEvents: 'auto' }}>
            <Toolbar aria-label="View" backdrop size="3">
              <ToolbarGroup>
                <ToolbarButton iconOnly aria-label="Zoom out" onClick={() => zoom(ZOOM_STEP)}>
                  <HugeiconsIcon icon={MinusSignIcon} strokeWidth={1.75} />
                </ToolbarButton>
                <ToolbarButton iconOnly aria-label="Fit view" onClick={fit}>
                  <HugeiconsIcon icon={CenterFocusIcon} strokeWidth={1.75} />
                </ToolbarButton>
                <ToolbarButton iconOnly aria-label="Zoom in" onClick={() => zoom(1 / ZOOM_STEP)}>
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.75} />
                </ToolbarButton>
              </ToolbarGroup>
            </Toolbar>
          </Box>
        </Box>
      </Shell.Content>
    </Shell.Root>
  );
}
