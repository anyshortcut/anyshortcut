// Development builds (`npm run build_dev`) talk to the dev deployment, which
// is what the old webpack BUILD_SCHEMA / BUILD_DOMAIN defines did.
const isDev = import.meta.env.MODE === 'development';
const schema = isDev ? 'http://' : 'https://';
const domain = isDev ? 'dev.anyshortcut.com' : 'anyshortcut.com';

export default {
  debug: isDev,
  domain,
  baseURL: `${schema}${domain}`,
  apiURL: `${schema}api.${domain}`,
  /** Where the user signs in; cloud mode needs the session cookie it sets. */
  accountURL: `${schema}${domain}/account`,
};
