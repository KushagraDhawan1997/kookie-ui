'use client';

import * as React from 'react';
import { APPEARANCE_STORAGE_KEY } from './appearance-script.js';

/**
 * Light and dark mode, decided before the first paint and kept on `<html>`.
 *
 * The server cannot know the visitor's mode, so `appearanceScript` runs synchronously in
 * `<head>`: the stored choice first, `prefers-color-scheme` otherwise. It writes the `light`
 * or `dark` class (which every token and component stylesheet already keys off) and
 * `data-appearance` on `<html>`. The root `<Theme>` keeps `appearance="inherit"`, so it
 * writes no class of its own and `<html>` is the one source of truth. Nested themes and
 * portals inherit it from there.
 *
 * `useAppearance` is the client half: an external store over `<html>` and the same storage
 * key. It never mirrors the mode into React state that could disagree with the DOM.
 */

type AppearanceChoice = 'system' | 'light' | 'dark';
type ResolvedAppearance = 'light' | 'dark';

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

// The last choice made on this page, for when storage is blocked and cannot hold it.
let pageChoice: AppearanceChoice = 'system';

function readChoice(): AppearanceChoice {
  try {
    const value = globalThis.localStorage?.getItem(APPEARANCE_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return pageChoice;
  }
}

function systemAppearance(): ResolvedAppearance {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function stamp(mode: ResolvedAppearance) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
  root.setAttribute('data-appearance', mode);
  root.style.colorScheme = mode;
}

function readResolved(): ResolvedAppearance {
  const root = document.documentElement;
  if (root.classList.contains('dark') || root.classList.contains('dark-theme')) return 'dark';
  if (root.classList.contains('light') || root.classList.contains('light-theme')) return 'light';
  return systemAppearance();
}

let snapshot: { choice: AppearanceChoice; resolved: ResolvedAppearance } | null = null;

function getSnapshot() {
  const choice = readChoice();
  const resolved = readResolved();
  if (!snapshot || snapshot.choice !== choice || snapshot.resolved !== resolved) {
    snapshot = { choice, resolved };
  }
  return snapshot;
}

const serverSnapshot = { choice: 'system' as AppearanceChoice, resolved: 'light' as ResolvedAppearance };

// With no stored choice, follow the system as it changes.
function onSystemChange() {
  if (readChoice() === 'system') {
    stamp(systemAppearance());
    emit();
  }
}

// Another tab changed the choice.
function onStorage(event: StorageEvent) {
  if (event.key !== APPEARANCE_STORAGE_KEY) return;
  const choice = readChoice();
  stamp(choice === 'system' ? systemAppearance() : choice);
  emit();
}

let media: MediaQueryList | null = null;

// One set of window listeners for every subscriber, so one change stamps `<html>` once.
function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', onSystemChange);
    window.addEventListener('storage', onStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    media?.removeEventListener('change', onSystemChange);
    media = null;
    window.removeEventListener('storage', onStorage);
  };
}

/** Applies a choice to `<html>` and stores it. The change applies even if storage is blocked. */
function setAppearance(choice: AppearanceChoice) {
  pageChoice = choice;
  try {
    if (choice === 'system') localStorage.removeItem(APPEARANCE_STORAGE_KEY);
    else localStorage.setItem(APPEARANCE_STORAGE_KEY, choice);
  } catch {
    // Storage is blocked: the mode still changes for this page.
  }
  stamp(choice === 'system' ? systemAppearance() : choice);
  emit();
}

/**
 * The page's light or dark mode. `choice` is what the person picked (`system` when they
 * haven't); `appearance` is what is showing. On the server and in the first client render it
 * reports `system` / `light`, then corrects without a hydration mismatch.
 */
function useAppearance() {
  const { choice, resolved } = React.useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
  return { choice, appearance: resolved, setAppearance } as const;
}

export { useAppearance, setAppearance };
export type { AppearanceChoice, ResolvedAppearance };
