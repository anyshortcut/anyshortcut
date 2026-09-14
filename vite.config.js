import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const r = (path) => fileURLToPath(new URL(path, import.meta.url));

const platform = process.env.PLATFORM === 'firefox' ? 'firefox' : 'chrome';

// Chrome Web Store extension keys (moved from the old build/config.js).
const CHROME_KEYS = {
  production:
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtsU34L7ro2a1etZPGPg4rRD5gVP4I7Px1mZuJqafP5Bqoh+wtVmOZgGNS3nlyGBfLCYphC3mmtYrZ8OvXLb+fRIe0sk/k/F+cIEZPmExin0epDN4jtA8ptT+FMDf6bFxRfwMrJCHMpjsfNWqhfrVEIBsOHQiDGQyy/05fYfwWl/XocFfEmKWayYiwdijSLa5io/dS71qp0VeDwudbQo9El9cf0CZdbTbYziVORXf7BQQNW56o/51Tg4X6kdNqs0Ck9c1rnZIqf92sNRmsfHKdhBFpWN1d3hD9rJ7ROriq69f3HjbOX3pAAJHJX7JqwapvGbk7A1loyAwbDgo8VQICwIDAQAB',
  development:
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3QF573d7o5O8RuZrOj+NpelxBENcKZX0dcVfUBgOn/PlxD3UWpqYYmTWsJKukun32cZwLHJMbF6ytg1Fs2HCsgPS6gAzWiyOFIj/xIOvjX31rSIR+Q/inTL5XG0EBJzwSa8jUa4RYGArqIR5GW6PeKdkhUsi1BnWQZI9jMr3/a3MBJHdzUKWSEV6dzmodIt9QELRIVhko1kFo0rI8ay02qGm+JYZtizyrdueA6FQ67xjZXJjUsObxl+0awmn7sRsPZNi+TAnvQY+xRHO8a1pBzGk9rcuvWZBGp2bQy8rb7AQ2YNzK/NuUWtHn1UMjfQC7qJHXS7cu4ouqQC7VRFILwIDAQAB',
};

/**
 * Merge manifest/common.json with the platform overrides and write
 * extension/manifest.json after the bundle is done.
 */
function extensionManifestPlugin(mode) {
  return {
    name: 'generate-extension-manifest',
    closeBundle() {
      const read = (path) => JSON.parse(readFileSync(r(path), 'utf-8'));
      const manifest = { ...read('./manifest/common.json'), ...read(`./manifest/${platform}.json`) };
      manifest.version = read('./package.json').version;
      if (mode === 'development') {
        manifest.name = 'Anyshortcut-Dev';
      }
      if (platform === 'chrome') {
        manifest.key = CHROME_KEYS[mode === 'development' ? 'development' : 'production'];
      } else {
        delete manifest.key;
      }
      writeFileSync(r('./extension/manifest.json'), JSON.stringify(manifest, null, 2));
    },
  };
}

const shared = {
  resolve: {
    alias: {
      '@': r('./src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/scss/_var.scss";`,
      },
    },
  },
};

/**
 * The extension is built in three passes because the outputs need
 * different module formats:
 * - pages (default): popup.html + tour.html as regular ESM pages
 * - content: content-script.js as a single IIFE (content scripts
 *   cannot be ES modules, so no code-splitting is allowed)
 * - background: background.js as a single IIFE so the same bundle
 *   works as a Chrome service worker and a Firefox background script
 */
export default defineConfig(({ mode }) => {
  const target = process.env.BUILD_TARGET || 'pages';

  if (target === 'content') {
    return {
      ...shared,
      publicDir: false,
      build: {
        outDir: 'extension',
        emptyOutDir: false,
        // Emit a real content-script.css file (referenced by the manifest)
        // instead of injecting styles from JS.
        cssCodeSplit: false,
        rollupOptions: {
          input: r('./src/script/content-script.js'),
          output: {
            format: 'iife',
            entryFileNames: 'content-script.js',
            assetFileNames: 'content-script[extname]',
          },
        },
      },
    };
  }

  if (target === 'background') {
    return {
      ...shared,
      publicDir: false,
      build: {
        outDir: 'extension',
        emptyOutDir: false,
        rollupOptions: {
          input: r('./src/background/index.js'),
          output: {
            format: 'iife',
            entryFileNames: 'background.js',
            assetFileNames: 'background[extname]',
          },
        },
      },
    };
  }

  return {
    ...shared,
    plugins: [vue(), extensionManifestPlugin(mode)],
    build: {
      outDir: 'extension',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: r('./popup.html'),
          tour: r('./tour.html'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name].js',
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
  };
});
