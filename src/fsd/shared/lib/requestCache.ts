type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

export type RequestCache = {
  getOrFetch: <T>(key: string, loader: () => Promise<T>, ttlMs: number) => Promise<T>;
  clear: (keyPrefix?: string) => void;
};

export const createRequestCache = (now: () => number = Date.now): RequestCache => {
  const values = new Map<string, CacheEntry>();
  const inFlight = new Map<string, Promise<unknown>>();
  const invalidationVersions = new Map<string, number>();

  const getOrFetch = <T>(key: string, loader: () => Promise<T>, ttlMs: number) => {
    const cached = values.get(key);
    if (cached && cached.expiresAt > now()) return Promise.resolve(cached.value as T);
    if (cached) values.delete(key);

    const pending = inFlight.get(key) as Promise<T> | undefined;
    if (pending) return pending;

    const requestVersion = invalidationVersions.get(key) ?? 0;
    const request = Promise.resolve()
      .then(loader)
      .then((value) => {
        if (ttlMs > 0 && (invalidationVersions.get(key) ?? 0) === requestVersion) {
          values.set(key, { value, expiresAt: now() + ttlMs });
        }
        return value;
      })
      .finally(() => {
        if (inFlight.get(key) === request) inFlight.delete(key);
      });

    inFlight.set(key, request);
    return request;
  };

  const clear = (keyPrefix?: string) => {
    const keys = new Set([...values.keys(), ...inFlight.keys(), ...invalidationVersions.keys()]);
    for (const key of keys) {
      if (!keyPrefix || key.startsWith(keyPrefix)) {
        values.delete(key);
        inFlight.delete(key);
        invalidationVersions.set(key, (invalidationVersions.get(key) ?? 0) + 1);
      }
    }
  };

  return { getOrFetch, clear };
};

export const authenticatedGetCache = createRequestCache();
