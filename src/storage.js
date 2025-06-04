// Local storage manager for offline-first extension
class LocalStorage {
  constructor() {
    this.STORAGE_KEYS = {
      SHORTCUTS: 'anyshortcut_shortcuts',
      PRIMARY_SHORTCUTS: 'anyshortcut_primary_shortcuts', 
      SECONDARY_SHORTCUTS: 'anyshortcut_secondary_shortcuts',
      SETTINGS: 'anyshortcut_settings',
      STATS: 'anyshortcut_stats'
    };
  }

  // Chrome extension storage API wrapper
  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  }

  async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  async remove(key) {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        resolve();
      });
    });
  }

  // Generate unique ID for shortcuts
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get all shortcuts
  async getAllShortcuts() {
    const primary = await this.get(this.STORAGE_KEYS.PRIMARY_SHORTCUTS) || {};
    const secondary = await this.get(this.STORAGE_KEYS.SECONDARY_SHORTCUTS) || {};
    return { primary, secondary };
  }

  // Get primary shortcuts
  async getPrimaryShortcuts() {
    return await this.get(this.STORAGE_KEYS.PRIMARY_SHORTCUTS) || {};
  }

  // Get secondary shortcuts
  async getSecondaryShortcuts() {
    return await this.get(this.STORAGE_KEYS.SECONDARY_SHORTCUTS) || {};
  }

  // Bind a new shortcut
  async bindShortcut(shortcut) {
    const shortcuts = shortcut.primary ? 
      await this.getPrimaryShortcuts() : 
      await this.getSecondaryShortcuts();
    
    const newShortcut = {
      id: this.generateId(),
      key: shortcut.key,
      url: shortcut.url,
      domain: shortcut.domain,
      comment: shortcut.comment,
      favicon: shortcut.favicon,
      primary: shortcut.primary,
      parentKey: shortcut.parentKey || null,
      open_times: 0,
      created_time: Date.now()
    };

    shortcuts[shortcut.key] = newShortcut;
    
    const storageKey = shortcut.primary ? 
      this.STORAGE_KEYS.PRIMARY_SHORTCUTS : 
      this.STORAGE_KEYS.SECONDARY_SHORTCUTS;
    
    await this.set(storageKey, shortcuts);
    return newShortcut;
  }

  // Remove a shortcut
  async unbindShortcut(id, including = false) {
    const primary = await this.getPrimaryShortcuts();
    const secondary = await this.getSecondaryShortcuts();

    // Find and remove from primary shortcuts
    for (const [key, shortcut] of Object.entries(primary)) {
      if (shortcut.id === id) {
        delete primary[key];
        await this.set(this.STORAGE_KEYS.PRIMARY_SHORTCUTS, primary);
        
        // If including secondary shortcuts, remove all secondary shortcuts for this domain
        if (including) {
          const updatedSecondary = {};
          for (const [secKey, secShortcut] of Object.entries(secondary)) {
            if (secShortcut.parentKey !== key) {
              updatedSecondary[secKey] = secShortcut;
            }
          }
          await this.set(this.STORAGE_KEYS.SECONDARY_SHORTCUTS, updatedSecondary);
        }
        return;
      }
    }

    // Find and remove from secondary shortcuts
    for (const [key, shortcut] of Object.entries(secondary)) {
      if (shortcut.id === id) {
        delete secondary[key];
        await this.set(this.STORAGE_KEYS.SECONDARY_SHORTCUTS, secondary);
        return;
      }
    }
  }

  // Increase shortcut open times
  async increaseShortcutOpenTimes(id) {
    const primary = await this.getPrimaryShortcuts();
    const secondary = await this.getSecondaryShortcuts();

    // Update in primary shortcuts
    for (const [key, shortcut] of Object.entries(primary)) {
      if (shortcut.id === id) {
        shortcut.open_times = (shortcut.open_times || 0) + 1;
        primary[key] = shortcut;
        await this.set(this.STORAGE_KEYS.PRIMARY_SHORTCUTS, primary);
        return shortcut;
      }
    }

    // Update in secondary shortcuts
    for (const [key, shortcut] of Object.entries(secondary)) {
      if (shortcut.id === id) {
        shortcut.open_times = (shortcut.open_times || 0) + 1;
        secondary[key] = shortcut;
        await this.set(this.STORAGE_KEYS.SECONDARY_SHORTCUTS, secondary);
        return shortcut;
      }
    }
  }

  // Get default shortcuts (predefined popular sites)
  getDefaultShortcuts() {
    return Promise.resolve([
      { key: 'G', url: 'https://www.google.com', comment: 'Google', favicon: 'https://www.google.com/favicon.ico', active: false },
      { key: 'F', url: 'https://www.facebook.com', comment: 'Facebook', favicon: 'https://www.facebook.com/favicon.ico', active: false },
      { key: 'T', url: 'https://www.twitter.com', comment: 'Twitter', favicon: 'https://www.twitter.com/favicon.ico', active: false },
      { key: 'Y', url: 'https://www.youtube.com', comment: 'YouTube', favicon: 'https://www.youtube.com/favicon.ico', active: false },
      { key: 'R', url: 'https://www.reddit.com', comment: 'Reddit', favicon: 'https://www.reddit.com/favicon.ico', active: false },
      { key: 'A', url: 'https://www.amazon.com', comment: 'Amazon', favicon: 'https://www.amazon.com/favicon.ico', active: false },
      { key: 'N', url: 'https://www.netflix.com', comment: 'Netflix', favicon: 'https://www.netflix.com/favicon.ico', active: false },
      { key: 'S', url: 'https://www.spotify.com', comment: 'Spotify', favicon: 'https://www.spotify.com/favicon.ico', active: false }
    ]);
  }

  // Bind default shortcuts
  async bindDefaultShortcuts(keys) {
    const defaults = await this.getDefaultShortcuts();
    const primary = await this.getPrimaryShortcuts();
    
    for (const key of keys) {
      const defaultShortcut = defaults.find(s => s.key === key);
      if (defaultShortcut && !primary[key]) {
        await this.bindShortcut({
          key: key,
          url: defaultShortcut.url,
          domain: new URL(defaultShortcut.url).hostname,
          comment: defaultShortcut.comment,
          favicon: defaultShortcut.favicon,
          primary: true
        });
      }
    }
  }

  // Mock stats (since we don't have real usage data)
  getShortcutWeekStats(shortcutId) {
    // Return mock weekly stats
    return Promise.resolve({
      0: Math.floor(Math.random() * 10), // Sunday
      1: Math.floor(Math.random() * 10), // Monday
      2: Math.floor(Math.random() * 10), // Tuesday
      3: Math.floor(Math.random() * 10), // Wednesday
      4: Math.floor(Math.random() * 10), // Thursday
      5: Math.floor(Math.random() * 10), // Friday
      6: Math.floor(Math.random() * 10)  // Saturday
    });
  }

  // Mock primary + secondary stats
  async getPrimarySecondaryShortcutWeekStats(primaryShortcutId) {
    const primary = await this.getPrimaryShortcuts();
    const secondary = await this.getSecondaryShortcuts();
    
    // Find the primary shortcut
    const primaryShortcut = Object.values(primary).find(s => s.id === primaryShortcutId);
    if (!primaryShortcut) {
      return Promise.resolve({0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0});
    }

    // Sum primary + related secondary usage
    const primaryTimes = primaryShortcut.open_times || 0;
    const secondaryTotal = Object.values(secondary)
      .filter(s => s.parentKey === primaryShortcut.key)
      .reduce((sum, s) => sum + (s.open_times || 0), 0);

    const total = primaryTimes + secondaryTotal;
    
    // Distribute randomly across the week
    return Promise.resolve({
      0: Math.floor(total * 0.1), 
      1: Math.floor(total * 0.15),
      2: Math.floor(total * 0.2),
      3: Math.floor(total * 0.15),
      4: Math.floor(total * 0.2),
      5: Math.floor(total * 0.15),
      6: Math.floor(total * 0.05)
    });
  }

  // No-op methods for removed server features
  getUserInfo() {
    return Promise.resolve({
      authenticated: true,
      subscriptionStatus: 'active'
    });
  }
}

export default new LocalStorage();