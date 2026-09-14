// Preferences backed by chrome.storage.local so they are shared between
// the popup, the tour page and the background service worker (which has
// no localStorage in Manifest V3).
//
// Getters are synchronous reads of an in-memory cache. Every context must
// `await prefs.init()` once (popup does it before mounting, the background
// does it while hydrating state) before using the getters.
import webext from './webext.js';

const PREFS_KEY = 'anyshortcut_prefs';

const DEFAULTS = {
  combinationKey: 'alt',
  openByBlank: true,
  compoundEnable: true,
  showCircle: 'only',
};

let cache = { ...DEFAULTS };

// Keep the cache fresh when another context (e.g. the popup) saves a preference.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[PREFS_KEY]) {
    cache = { ...DEFAULTS, ...(changes[PREFS_KEY].newValue || {}) };
  }
});

function save(key, value) {
  cache[key] = value;
  return webext.storage.local.set({ [PREFS_KEY]: cache });
}

// Keys used by the MV2 build, which stored preferences in localStorage.
const LEGACY_KEYS = {
  combinationKey: 'combinationKey',
  openByBlank: 'openByBlank',
  compoundEnable: 'compoundEnable',
  showCircle: 'showCircle',
};

/**
 * Read the MV2 preferences out of localStorage.
 *
 * A service worker has no localStorage, so this only finds anything when
 * called from the popup or the tour page — which is enough, since one of
 * them runs long before the settings matter.
 *
 * @returns the stored preferences, or null when there is nothing to migrate.
 */
function readLegacyPrefs() {
  if (typeof localStorage === 'undefined') return null;

  const legacy = {};
  const combinationKey = localStorage.getItem(LEGACY_KEYS.combinationKey);
  if (combinationKey !== null) legacy.combinationKey = combinationKey;

  const showCircle = localStorage.getItem(LEGACY_KEYS.showCircle);
  if (showCircle !== null) legacy.showCircle = showCircle;

  for (const key of ['openByBlank', 'compoundEnable']) {
    const raw = localStorage.getItem(LEGACY_KEYS[key]);
    if (raw !== null) {
      try {
        legacy[key] = JSON.parse(raw);
      } catch {
        // Ignore an unparsable value and keep the default.
      }
    }
  }

  return Object.keys(legacy).length > 0 ? legacy : null;
}

function clearLegacyPrefs() {
  Object.values(LEGACY_KEYS).forEach((key) => localStorage.removeItem(key));
}

export default {
  async init() {
    const result = await webext.storage.local.get(PREFS_KEY);
    const stored = result[PREFS_KEY];
    if (stored) {
      cache = { ...DEFAULTS, ...stored };
      return;
    }

    // Nothing stored yet: this may be an upgrade from the MV2 build,
    // whose preferences live in localStorage.
    const legacy = readLegacyPrefs();
    cache = { ...DEFAULTS, ...(legacy || {}) };
    if (legacy) {
      await webext.storage.local.set({ [PREFS_KEY]: cache });
      clearLegacyPrefs();
    }
  },
  getDefaultCombinationKey() {
    return cache.combinationKey;
  },
  setDefaultCombinationKey(value) {
    return save('combinationKey', value);
  },
  isShortcutOpenByBlank() {
    return cache.openByBlank;
  },
  setShortcutOpenByBlank(value) {
    return save('openByBlank', value);
  },
  isCompoundShortcutEnable() {
    return cache.compoundEnable;
  },
  setCompoundShortcutEnable(value) {
    return save('compoundEnable', value);
  },
  getShowCircleConfig() {
    return cache.showCircle;
  },
  setShowCircleConfig(value) {
    return save('showCircle', value);
  },
};
