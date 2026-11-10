"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Engine } from "./engine";
import type { Music } from "./music";
import styles from "./kookify.module.css";

const NO_WORDS: string[] = [];

/** Stickers need WebGL 2; without it the button steps aside rather than doing nothing. */
function hasWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * The Kookie button, bottom right. Pressing it slaps stickers over the page; pressing again
 * flings them all off. Three.js and the sticker art load on the first press only. It stays on
 * while moving between pages, and a reload starts the page clean.
 */
export function Kookify({
  stickers,
  words = NO_WORDS,
  button = "/kookify/button.webp",
}: {
  stickers: string[];
  words?: string[];
  button?: string;
}) {
  const [on, setOn] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const engine = useRef<Engine | null>(null);
  const busy = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);
  const music = useRef<Music | null>(null);
  const pathname = usePathname();

  const start = useCallback(async () => {
    if (busy.current || engine.current || !stickers.length) return;
    if (!hasWebGL()) {
      setUnsupported(true);
      return;
    }
    busy.current = true;
    setOn(true);
    // iOS only shares device tilt (which moves the light on the foil) when asked from a tap.
    const orientation = globalThis.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    orientation?.requestPermission?.().catch(() => {});
    // Audio must be started inside the press itself.
    try {
      audioRef.current ??= new AudioContext();
      audioRef.current.resume().catch(() => {});
    } catch {}
    const audio = audioRef.current;
    try {
      const [{ createEngine }, { createSound }, { createMusic, isTrack }] = await Promise.all([
        import("./engine"),
        import("./sound"),
        import("./music"),
      ]);
      const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const sound = audio ? createSound(audio) : undefined;
      engine.current = await createEngine({ stickers, words, reducedMotion, sound });
      engine.current.slap();
      if (audio) {
        // A different theme each page load; ?music=0|a|b|c pins one.
        const pick = new URLSearchParams(location.search).get("music");
        const themes = ["0", "a", "b", "c"] as const;
        music.current ??= createMusic(audio, isTrack(pick) ? pick : themes[Math.floor(Math.random() * themes.length)]);
        music.current.start();
      }
    } catch {
      setOn(false);
    } finally {
      busy.current = false;
    }
  }, [stickers, words]);

  const stop = useCallback(async () => {
    if (busy.current || !engine.current) return;
    busy.current = true;
    setOn(false);
    const current = engine.current;
    music.current?.stop();
    await current.clear();
    current.dispose();
    engine.current = null;
    // Let the music's fade finish, then put audio to sleep until the next press.
    setTimeout(() => {
      if (!engine.current) audioRef.current?.suspend().catch(() => {});
    }, 300);
    busy.current = false;
  }, []);

  useEffect(
    () => () => {
      music.current?.stop();
      engine.current?.dispose();
      engine.current = null;
    },
    [],
  );

  // A new page may scroll in a new element; look again once it has rendered.
  useEffect(() => {
    const id = requestAnimationFrame(() => engine.current?.rescan());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  if (unsupported) return null;

  return (
    <button
      type="button"
      className={styles.button}
      data-kookify-ui=""
      aria-pressed={on}
      aria-label="Kookify"
      title={on ? "Un-Kookify" : "Kookify"}
      onClick={() => (on ? stop() : start())}
    >
      <img src={button} alt="" width={256} height={256} draggable={false} />
    </button>
  );
}
