// Cloud mode: anyshortcut.com is the source of truth.
//
// Authentication is the session cookie set by signing in on the website.
// Manifest V2 background pages sent that cookie on cross-origin XHR
// automatically; a Manifest V3 service worker does not, so every request
// here opts in with `credentials: 'include'`. The extension may send these
// requests at all because the manifest asks for <all_urls> host access.
import config from '../config';
import storage from '../storage';
import type {
  DefaultShortcut,
  PrimaryShortcuts,
  SecondaryShortcuts,
  Shortcut,
  UserInfo,
  WeekStats,
} from '../types';
import { NotAuthenticatedError } from './types';
import type { AllShortcuts, Backend, BindShortcutInput } from './types';

/** The API wraps every response in this envelope; 200 is its own success code. */
interface Envelope<T> {
  code: number;
  data: T;
  message: string;
}

const SUCCESS = 200;
// The API answers "miss token" with its own code when the session is absent.
const MISSING_TOKEN = 1000;

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${config.apiURL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
  } catch (error) {
    throw new Error(`Cannot reach anyshortcut.com: ${(error as Error).message}`);
  }

  const body = (await response.json()) as Envelope<T>;
  if (body.code === MISSING_TOKEN || response.status === 401) {
    throw new NotAuthenticatedError(body.message);
  }
  if (body.code !== SUCCESS) {
    throw new Error(body.message || `Request to ${path} failed with code ${body.code}`);
  }
  return body.data;
}

const get = <T>(path: string) => call<T>(path, { method: 'GET' });
const post = <T>(path: string, body?: unknown) =>
  call<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
const put = <T>(path: string, body?: unknown) =>
  call<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) });

/**
 * The API returns primary shortcuts as a list of single-entry objects
 * (`[{ G: shortcut }, ...]`) while everything in the extension expects one
 * flat record keyed by shortcut key.
 */
function toPrimaryRecord(primary: Record<string, Shortcut>[] | PrimaryShortcuts): PrimaryShortcuts {
  if (!Array.isArray(primary)) return primary || {};
  return primary.reduce<PrimaryShortcuts>((all, entry) => Object.assign(all, entry), {});
}

const cloudBackend: Backend = {
  requiresAuth: true,

  getUserInfo() {
    return get<UserInfo>('/user/info');
  },

  async getAllShortcuts(): Promise<AllShortcuts> {
    const data = await get<{
      primary: Record<string, Shortcut>[] | PrimaryShortcuts;
      secondary: SecondaryShortcuts;
    }>('/shortcuts/all');
    const shortcuts = {
      primary: toPrimaryRecord(data.primary),
      secondary: data.secondary || {},
    };
    // Mirror the result so the service worker can answer key presses
    // without a round trip, and so shortcuts still work offline.
    await storage.writeCloudCache(shortcuts);
    return shortcuts;
  },

  bindShortcut(shortcut: BindShortcutInput) {
    return post<Shortcut>('/shortcut/key', shortcut);
  },

  async unbindShortcut(id: string, including?: boolean) {
    await put(`/shortcut/${id}/unbind`, { including: including });
  },

  increaseShortcutOpenTimes(id: string) {
    return put<Shortcut>(`/shortcut/${id}/times`);
  },

  getDefaultShortcuts() {
    return get<DefaultShortcut[]>('/shortcuts/default');
  },

  async bindDefaultShortcuts(keys: string) {
    await post('/shortcut/default', { keys: keys });
  },

  getShortcutWeekStats(shortcutId: string) {
    return get<WeekStats>(`/stats/shortcut?shortcut_id=${shortcutId}`);
  },

  getPrimarySecondaryShortcutWeekStats(primaryShortcutId: string) {
    return get<WeekStats>(`/stats/primary?shortcut_id=${primaryShortcutId}`);
  },
};

export default cloudBackend;
