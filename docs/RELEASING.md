# Releasing

Publishing is done by the `Release` workflow. Tagging a commit builds the
extension for both platforms, uploads it to the Chrome Web Store and Firefox
Add-ons, and attaches the packages to a GitHub release.

```bash
npm version minor     # or patch / major — writes package.json and tags
git push --follow-tags
```

The manifest version is generated from `package.json`, so `npm version` is
the only place a release number is set. The workflow refuses to run if the
tag and `package.json` disagree.

To rehearse without submitting anything, run the workflow manually from the
Actions tab with **dry run** left on. It builds and lints both packages and
uploads them as a workflow artifact instead of sending them to the stores.

## Building the packages by hand

```bash
npm run package:chrome    # dist/anyshortcut-chrome-<version>.zip
npm run package:firefox   # dist/anyshortcut-firefox-<version>.zip
npm run package:source    # dist/anyshortcut-source-<version>.zip, for AMO
```

Each `package:*` script rebuilds `extension/` for that platform first, so run
them one at a time rather than in parallel.

## Repository secrets

### Chrome Web Store

| Secret | Where it comes from |
| --- | --- |
| `CHROME_EXTENSION_ID` | The item id in the Web Store developer dashboard URL |
| `CHROME_CLIENT_ID` | OAuth client, below |
| `CHROME_CLIENT_SECRET` | OAuth client, below |
| `CHROME_REFRESH_TOKEN` | OAuth client, below |

1. In the Google Cloud Console, enable the **Chrome Web Store API** for a
   project.
2. Configure the OAuth consent screen and **publish it**. Leaving it in
   "Testing" expires refresh tokens after seven days, which turns into a
   release that fails a week after it was set up.
3. Create an OAuth client ID of type **Desktop app**. That gives the client
   id and secret.
4. Exchange them for a refresh token:

   ```bash
   npx chrome-webstore-upload-keys
   ```

   It opens a browser, asks for the client id and secret, and prints the
   refresh token. Google removed the out-of-band flow, so a manual URL with
   `urn:ietf:wg:oauth:2.0:oob` will not work.

### Firefox Add-ons

| Secret | Where it comes from |
| --- | --- |
| `AMO_JWT_ISSUER` | JWT issuer at https://addons.mozilla.org/developers/addon/api/key/ |
| `AMO_JWT_SECRET` | JWT secret from the same page — shown once |

The add-on is submitted to the `listed` channel, which means a human review.
The workflow does not wait for the result; it appears on AMO once reviewed.

Because the uploaded bundle is minified, AMO requires the sources it was
built from. `package:source` produces that archive with `git archive`, so it
contains exactly what is committed, minus the website and the prebuilt
`extension/` directory (see `.gitattributes`).

## Before tagging

Store review is slow and a bad version is expensive to withdraw, so load the
built extension in both browsers and check the paths CI cannot: that the
service worker starts, that shortcuts still fire after it has been idle long
enough to be shut down, and that binding a shortcut works. `docs/` has no
substitute for this, and neither does CI.
