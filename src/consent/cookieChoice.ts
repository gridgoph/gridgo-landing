import { useSyncExternalStore } from 'react';

/**
 * The visitor's cookie choice, shared by the banner, the settings dialog and
 * anything that loads third-party content.
 *
 * What the site keeps for itself (theme, opener flag, support-form timestamp,
 * this choice) is needed for it to work and is never asked about. The one
 * thing that is optional is the YouTube player in How it Works: YouTube sets
 * its own tracking cookies as soon as the embed loads, so the embed stays off
 * until the visitor allows it. The thumbnails come from YouTube's image host,
 * which sets no cookies, and are always shown.
 *
 * `v` is the shape of the question. Adding another optional category means
 * bumping it, so everyone is asked again rather than having it switched on.
 */
const STORAGE_KEY = 'gridgo-cookie-choice';
const CHOICE_VERSION = 1;

export type CookieChoice = {
  /** YouTube may load in How it Works. */
  videos: boolean;
  /** ISO time the visitor made the choice. */
  decidedAt: string;
};

type Stored = CookieChoice & { v: number };

function readStored(): CookieChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (parsed.v !== CHOICE_VERSION || typeof parsed.videos !== 'boolean') return null;
    return { videos: parsed.videos, decidedAt: String(parsed.decidedAt ?? '') };
  } catch {
    // Blocked storage, or a value from something else: ask again.
    return null;
  }
}

let loaded = false;
let choice: CookieChoice | null = null;
let settingsOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function currentChoice() {
  if (!loaded) {
    choice = readStored();
    loaded = true;
  }
  return choice;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab changing its mind changes this one too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    choice = readStored();
    loaded = true;
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function saveCookieChoice(videos: boolean) {
  choice = { videos, decidedAt: new Date().toISOString() };
  loaded = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: CHOICE_VERSION, ...choice }));
  } catch {
    // Still honoured for this visit; the banner simply returns next time.
  }
  emit();
}

export function openCookieSettings() {
  settingsOpen = true;
  emit();
}

export function closeCookieSettings() {
  settingsOpen = false;
  emit();
}

/**
 * `undefined` while the answer is unknown — on the server, and during
 * hydration of a prerendered page — so nothing that depends on it renders
 * until the browser has read storage. `null` means the visitor has not chosen.
 */
export function useCookieChoice(): CookieChoice | null | undefined {
  return useSyncExternalStore(subscribe, currentChoice, () => undefined);
}

export function useCookieSettingsOpen() {
  return useSyncExternalStore(subscribe, () => settingsOpen, () => false);
}

/** True only when the visitor has allowed YouTube. */
export function useVideosAllowed() {
  return useCookieChoice()?.videos === true;
}
