import webext from './webext';
import type {
  BackendMode,
  DefaultShortcut,
  PrimaryShortcuts,
  SecondaryShortcuts,
  Shortcut,
  WeekStats,
} from './types';

/** Input for binding a new shortcut (id/counters are assigned here). */
export interface BindShortcutInput {
  key: string;
  url: string;
  title?: string;
  domain: string;
  comment?: string;
  favicon?: string;
  primary: boolean;
}

// chrome.storage access.
//
// Data model:
// - PRIMARY_SHORTCUTS:   { [key]: shortcut }
// - SECONDARY_SHORTCUTS: { [domain]: { [key]: shortcut } }
//
// Local mode owns the PRIMARY/SECONDARY keys outright. Cloud mode mirrors
// the server into the CLOUD_* keys, so the two modes never overwrite each
// other and switching back and forth loses nothing.
class LocalStorage {
  STORAGE_KEYS = {
    SHORTCUTS: 'anyshortcut_shortcuts',
    PRIMARY_SHORTCUTS: 'anyshortcut_primary_shortcuts',
    SECONDARY_SHORTCUTS: 'anyshortcut_secondary_shortcuts',
    CLOUD_PRIMARY_SHORTCUTS: 'anyshortcut_cloud_primary_shortcuts',
    CLOUD_SECONDARY_SHORTCUTS: 'anyshortcut_cloud_secondary_shortcuts',
    SETTINGS: 'anyshortcut_settings',
    STATS: 'anyshortcut_stats',
  } as const;

  /** The pair of keys holding the shortcuts the given mode reads from. */
  keysForMode(mode: BackendMode) {
    return mode === 'cloud'
      ? {
          primary: this.STORAGE_KEYS.CLOUD_PRIMARY_SHORTCUTS,
          secondary: this.STORAGE_KEYS.CLOUD_SECONDARY_SHORTCUTS,
        }
      : {
          primary: this.STORAGE_KEYS.PRIMARY_SHORTCUTS,
          secondary: this.STORAGE_KEYS.SECONDARY_SHORTCUTS,
        };
  }

  /**
   * Read the shortcuts the given mode is currently serving. This is what the
   * service worker hydrates from; in cloud mode it is the mirror of the last
   * successful sync, which is also what keeps shortcuts working offline.
   */
  async readSnapshot(
    mode: BackendMode
  ): Promise<{ primary: PrimaryShortcuts; secondary: SecondaryShortcuts }> {
    const keys = this.keysForMode(mode);
    return {
      primary: (await this.get<PrimaryShortcuts>(keys.primary)) || {},
      secondary: (await this.get<SecondaryShortcuts>(keys.secondary)) || {},
    };
  }

  /** Replace the cloud mirror after a successful sync. */
  async writeCloudCache(shortcuts: {
    primary: PrimaryShortcuts;
    secondary: SecondaryShortcuts;
  }): Promise<void> {
    await webext.storage.local.set({
      [this.STORAGE_KEYS.CLOUD_PRIMARY_SHORTCUTS]: shortcuts.primary,
      [this.STORAGE_KEYS.CLOUD_SECONDARY_SHORTCUTS]: shortcuts.secondary,
    });
  }

  // Chrome extension storage API wrapper
  async get<T>(key: string): Promise<T | null> {
    const result = await webext.storage.local.get([key]);
    return (result[key] as T) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    return webext.storage.local.set({ [key]: value });
  }

  async remove(key: string): Promise<void> {
    return webext.storage.local.remove([key]);
  }

  // Generate unique ID for shortcuts
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get all shortcuts
  async getAllShortcuts(): Promise<{ primary: PrimaryShortcuts; secondary: SecondaryShortcuts }> {
    const primary = (await this.get<PrimaryShortcuts>(this.STORAGE_KEYS.PRIMARY_SHORTCUTS)) || {};
    const secondary =
      (await this.get<SecondaryShortcuts>(this.STORAGE_KEYS.SECONDARY_SHORTCUTS)) || {};
    return { primary, secondary };
  }

  // Get primary shortcuts
  async getPrimaryShortcuts(): Promise<PrimaryShortcuts> {
    return (await this.get<PrimaryShortcuts>(this.STORAGE_KEYS.PRIMARY_SHORTCUTS)) || {};
  }

  // Get secondary shortcuts, nested by domain
  async getSecondaryShortcuts(): Promise<SecondaryShortcuts> {
    return (await this.get<SecondaryShortcuts>(this.STORAGE_KEYS.SECONDARY_SHORTCUTS)) || {};
  }

  // Iterate every secondary shortcut across all domains
  *iterateSecondary(
    secondary: SecondaryShortcuts
  ): Generator<{ domain: string; key: string; shortcut: Shortcut }> {
    for (const [domain, shortcuts] of Object.entries(secondary)) {
      for (const [key, shortcut] of Object.entries(shortcuts)) {
        yield { domain, key, shortcut };
      }
    }
  }

  // Bind a new shortcut
  async bindShortcut(shortcut: BindShortcutInput): Promise<Shortcut> {
    const newShortcut: Shortcut = {
      id: this.generateId(),
      key: shortcut.key,
      url: shortcut.url,
      title: shortcut.title,
      domain: shortcut.domain,
      comment: shortcut.comment,
      favicon: shortcut.favicon,
      primary: shortcut.primary,
      open_times: 0,
      created_time: Date.now(),
    };

    if (shortcut.primary) {
      const primary = await this.getPrimaryShortcuts();
      primary[shortcut.key] = newShortcut;
      await this.set(this.STORAGE_KEYS.PRIMARY_SHORTCUTS, primary);
    } else {
      const secondary = await this.getSecondaryShortcuts();
      if (!secondary[shortcut.domain]) {
        secondary[shortcut.domain] = {};
      }
      secondary[shortcut.domain][shortcut.key] = newShortcut;
      await this.set(this.STORAGE_KEYS.SECONDARY_SHORTCUTS, secondary);
    }
    return newShortcut;
  }

  // Remove a shortcut
  async unbindShortcut(id: string, including = false): Promise<void> {
    const primary = await this.getPrimaryShortcuts();
    const secondary = await this.getSecondaryShortcuts();

    // Find and remove from primary shortcuts
    for (const [key, shortcut] of Object.entries(primary)) {
      if (shortcut.id === id) {
        delete primary[key];
        await this.set(this.STORAGE_KEYS.PRIMARY_SHORTCUTS, primary);

        // If including secondary shortcuts, remove all secondary shortcuts for this domain
        if (including && shortcut.domain) {
          delete secondary[shortcut.domain];
          await this.set(this.STORAGE_KEYS.SECONDARY_SHORTCUTS, secondary);
        }
        return;
      }
    }

    // Find and remove from secondary shortcuts
    for (const { domain, key, shortcut } of this.iterateSecondary(secondary)) {
      if (shortcut.id === id) {
        delete secondary[domain][key];
        // Remove empty secondary shortcut at domain level
        if (Object.keys(secondary[domain]).length === 0) {
          delete secondary[domain];
        }
        await this.set(this.STORAGE_KEYS.SECONDARY_SHORTCUTS, secondary);
        return;
      }
    }
  }

  // Increase shortcut open times
  async increaseShortcutOpenTimes(id: string): Promise<Shortcut | undefined> {
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
    for (const { domain, key, shortcut } of this.iterateSecondary(secondary)) {
      if (shortcut.id === id) {
        shortcut.open_times = (shortcut.open_times || 0) + 1;
        secondary[domain][key] = shortcut;
        await this.set(this.STORAGE_KEYS.SECONDARY_SHORTCUTS, secondary);
        return shortcut;
      }
    }
  }

  // Get default shortcuts (predefined popular sites)
  getDefaultShortcuts(): Promise<DefaultShortcut[]> {
    return Promise.resolve([
      {
        key: 'G',
        url: 'https://www.google.com',
        comment: 'Google',
        favicon: 'https://www.google.com/favicon.ico',
        active: false,
      },
      {
        key: 'F',
        url: 'https://www.facebook.com',
        comment: 'Facebook',
        favicon: 'https://www.facebook.com/favicon.ico',
        active: false,
      },
      {
        key: 'T',
        url: 'https://www.twitter.com',
        comment: 'Twitter',
        favicon: 'https://www.twitter.com/favicon.ico',
        active: false,
      },
      {
        key: 'Y',
        url: 'https://www.youtube.com',
        comment: 'YouTube',
        favicon: 'https://www.youtube.com/favicon.ico',
        active: false,
      },
      {
        key: 'R',
        url: 'https://www.reddit.com',
        comment: 'Reddit',
        favicon: 'https://www.reddit.com/favicon.ico',
        active: false,
      },
      {
        key: 'A',
        url: 'https://www.amazon.com',
        comment: 'Amazon',
        favicon: 'https://www.amazon.com/favicon.ico',
        active: false,
      },
      {
        key: 'N',
        url: 'https://www.netflix.com',
        comment: 'Netflix',
        favicon: 'https://www.netflix.com/favicon.ico',
        active: false,
      },
      {
        key: 'S',
        url: 'https://www.spotify.com',
        comment: 'Spotify',
        favicon: 'https://www.spotify.com/favicon.ico',
        active: false,
      },
    ]);
  }

  // Bind default shortcuts
  async bindDefaultShortcuts(keys: string): Promise<void> {
    const defaults = await this.getDefaultShortcuts();
    const primary = await this.getPrimaryShortcuts();

    for (const key of keys) {
      const defaultShortcut = defaults.find((s) => s.key === key);
      if (defaultShortcut && !primary[key]) {
        await this.bindShortcut({
          key: key,
          url: defaultShortcut.url,
          title: defaultShortcut.comment,
          domain: new URL(defaultShortcut.url).hostname.replace(/^www\./, ''),
          comment: defaultShortcut.comment,
          favicon: defaultShortcut.favicon,
          primary: true,
        });
      }
    }
  }

  // Mock stats (since we don't have real usage data)
  getShortcutWeekStats(): Promise<WeekStats> {
    // Return mock weekly stats
    return Promise.resolve({
      0: Math.floor(Math.random() * 10), // Sunday
      1: Math.floor(Math.random() * 10), // Monday
      2: Math.floor(Math.random() * 10), // Tuesday
      3: Math.floor(Math.random() * 10), // Wednesday
      4: Math.floor(Math.random() * 10), // Thursday
      5: Math.floor(Math.random() * 10), // Friday
      6: Math.floor(Math.random() * 10), // Saturday
    });
  }

  // Mock primary + secondary stats
  async getPrimarySecondaryShortcutWeekStats(primaryShortcutId: string): Promise<WeekStats> {
    const primary = await this.getPrimaryShortcuts();
    const secondary = await this.getSecondaryShortcuts();

    // Find the primary shortcut
    const primaryShortcut = Object.values(primary).find((s) => s.id === primaryShortcutId);
    if (!primaryShortcut) {
      return { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    }

    // Sum primary + related secondary usage
    const primaryTimes = primaryShortcut.open_times || 0;
    const domainShortcuts = secondary[primaryShortcut.domain] || {};
    const secondaryTotal = Object.values(domainShortcuts).reduce(
      (sum, s) => sum + (s.open_times || 0),
      0
    );

    const total = primaryTimes + secondaryTotal;

    // Distribute randomly across the week
    return {
      0: Math.floor(total * 0.1),
      1: Math.floor(total * 0.15),
      2: Math.floor(total * 0.2),
      3: Math.floor(total * 0.15),
      4: Math.floor(total * 0.2),
      5: Math.floor(total * 0.15),
      6: Math.floor(total * 0.05),
    };
  }
}

export default new LocalStorage();
