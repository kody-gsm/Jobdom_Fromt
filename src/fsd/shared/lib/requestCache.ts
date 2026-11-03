type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

export type RequestCache = {
  getOrFetch: <T>(key: string, loader: () => Promise<T>, ttlMs: number) => Promise<T>;
  clear: (keyPrefix?: string) => void;
};

export const createRequestCache = (now: () => number = Date.now, maxEntries = 100): RequestCache => {
  const values = new Map<string, CacheEntry>();
  const inFlight = new Map<string, Promise<unknown>>();

  const prune = () => {
    const timestamp = now();
    for (const [key, entry] of values) {
      if (entry.expiresAt <= timestamp) values.delete(key);
    }
    while (values.size > Math.max(0, maxEntries)) {
      const oldest = values.keys().next().value;
      if (oldest === undefined) break;
      values.delete(oldest);
    }
  };

  const getOrFetch = <T>(key: string, loader: () => Promise<T>, ttlMs: number) => {
    prune();
    const cached = values.get(key);
    if (cached) {
      values.delete(key);
      values.set(key, cached);
      return Promise.resolve(cached.value as T);
    }

    const pending = inFlight.get(key) as Promise<T> | undefined;
    if (pending) return pending;

    const request = Promise.resolve()
      .then(loader)
      .then((value) => {
        if (ttlMs > 0 && inFlight.get(key) === request) {
          values.set(key, { value, expiresAt: now() + ttlMs });
          prune();
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
    const keys = new Set([...values.keys(), ...inFlight.keys()]);
    for (const key of keys) {
      if (!keyPrefix || key.startsWith(keyPrefix)) {
        values.delete(key);
        inFlight.delete(key);
      }
    }
  };

  return { getOrFetch, clear };
};

export const authenticatedGetCache = createRequestCache();
