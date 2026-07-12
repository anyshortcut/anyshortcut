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

export default {
  async init() {
    const result = await webext.storage.local.get(PREFS_KEY);
    cache = { ...DEFAULTS, ...(result[PREFS_KEY] || {}) };
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
