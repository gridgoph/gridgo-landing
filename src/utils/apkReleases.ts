import { downloadsBasePath } from './landingLinks';
import type { GridgoApp } from './landingLinks';

/**
 * The JSON sidecar each app's build writes next to its APK in
 * `~/gridgo/downloads/`, mounted read-only into this container.
 *
 *   {"app":"client","file":"gridgo-client.apk","bytes":1100228,
 *    "sha256":"ac78...","updated":"2026-08-11T00:48:00Z"}
 *
 * `version` is optional: the server writes it only once the release workflow
 * passes the app's version to `upload-apk`. Until then the card shows the size
 * alone, and a malformed version is dropped rather than failing the build.
 */
export type ApkSidecar = {
  app: string;
  file: string;
  bytes: number;
  sha256: string;
  updated: string;
  version?: string;
};

export type ApkRelease =
  | { state: 'loading' }
  /** No sidecar on the server — this app has never been uploaded. */
  | { state: 'unavailable'; reason: string }
  | { state: 'available'; downloadUrl: string; sidecar: ApkSidecar };

export function sidecarUrl(app: GridgoApp) {
  return `${downloadsBasePath}/${app.slug}.json`;
}

function isSidecar(value: unknown): value is ApkSidecar {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.file === 'string' &&
    v.file.length > 0 &&
    typeof v.bytes === 'number' &&
    Number.isFinite(v.bytes) &&
    v.bytes > 0 &&
    typeof v.sha256 === 'string' &&
    v.sha256.length > 0 &&
    typeof v.updated === 'string'
  );
}

/**
 * A build that has not been uploaded yet is the normal case, not an error — the
 * page must show "not available" rather than a broken link or a 0-byte download.
 */
export async function fetchApkRelease(app: GridgoApp): Promise<ApkRelease> {
  let response: Response;
  try {
    response = await fetch(sidecarUrl(app), { cache: 'no-store' });
  } catch {
    return { state: 'unavailable', reason: 'We could not reach the download server just now.' };
  }

  if (!response.ok) {
    return {
      state: 'unavailable',
      reason: 'No build has been published for this app yet.',
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { state: 'unavailable', reason: 'The published build details could not be read.' };
  }

  if (!isSidecar(payload)) {
    return { state: 'unavailable', reason: 'The published build details are incomplete.' };
  }

  // Never let a sidecar point outside the downloads directory.
  const safeFile = payload.file.replace(/[^A-Za-z0-9._-]/g, '');
  if (!safeFile.endsWith('.apk')) {
    return { state: 'unavailable', reason: 'The published build details are incomplete.' };
  }

  const { version, ...rest } = payload;
  const sidecar: ApkSidecar = { ...rest, file: safeFile };
  if (typeof version === 'string' && /^\d+(\.\d+){1,3}$/.test(version.trim())) {
    sidecar.version = version.trim();
  }

  return {
    state: 'available',
    downloadUrl: `${downloadsBasePath}/${safeFile}`,
    sidecar,
  };
}

export function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * The byte count itself, which no unit convention can round away — the one
 * figure a person can compare against a file's details to spot a download
 * that was cut short.
 */
export function formatExactBytes(bytes: number) {
  return `${new Intl.NumberFormat('en-PH').format(bytes)} bytes`;
}

export function formatUpdated(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
