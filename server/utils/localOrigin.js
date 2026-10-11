const localHosts = new Set(['localhost', '127.0.0.1']);

/** Allow Vite's local dev ports, including its automatic port increments. */
export function isAllowedLocalOrigin(origin, configuredOrigins = []) {
  if (!origin || configuredOrigins.includes(origin)) return true;
  try {
    const url = new URL(origin);
    const port = Number(url.port);
    return url.protocol === 'http:' && localHosts.has(url.hostname)
      && Number.isInteger(port) && port >= 5173 && port <= 5200;
  } catch {
    return false;
  }
}
