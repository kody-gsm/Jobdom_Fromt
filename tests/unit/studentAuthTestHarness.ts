import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

// Execute the actual hook modules with controlled React scheduling and browser APIs.
// No renderer/DOM dependency is installed in this repository.
export const loadAuthModule = <T>(path: string, imports: Record<string, unknown>): T => {
  const filename = resolve(path);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  const evaluatedModule = { exports: {} };
  const require = (specifier: string) => {
    if (!(specifier in imports)) throw new Error(`Uncontrolled test import: ${specifier}`);
    return imports[specifier];
  };
  new Function("require", "module", "exports", outputText)(require, evaluatedModule, evaluatedModule.exports);
  return evaluatedModule.exports as T;
};

type Effect = { dependencies?: readonly unknown[]; cleanup?: () => void };
const sameDependencies = (a?: readonly unknown[], b?: readonly unknown[]) =>
  a !== undefined && b !== undefined && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));

export const createAuthHookRuntime = () => {
  const slots: unknown[] = [];
  let cursor = 0;
  let dirty = false;
  let effects: Array<() => void> = [];
  const effectSlots = new Set<number>();
  const react = {
    useState<T>(initial: T | (() => T)) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? (initial as () => T)() : initial;
      return [slots[index] as T, (next: T | ((previous: T) => T)) => {
        const value = typeof next === "function" ? (next as (previous: T) => T)(slots[index] as T) : next;
        if (!Object.is(slots[index], value)) { slots[index] = value; dirty = true; }
      }] as const;
    },
    useRef<T>(initial: T) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index] as { current: T };
    },
    useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]) {
      const index = cursor++;
      const previous = slots[index] as Effect | undefined;
      if (previous && sameDependencies(previous.dependencies, dependencies)) return;
      effects.push(() => {
        previous?.cleanup?.();
        slots[index] = { dependencies, cleanup: effect() };
      });
      effectSlots.add(index);
    },
    useCallback<T>(callback: T, dependencies: readonly unknown[]) {
      const index = cursor++;
      const previous = slots[index] as { callback: T; dependencies: readonly unknown[] } | undefined;
      if (!previous || !sameDependencies(previous.dependencies, dependencies)) slots[index] = { callback, dependencies };
      return (slots[index] as { callback: T }).callback;
    },
  };
  return {
    react,
    mount<T>(hook: () => T) {
      let current: T;
      const flush = () => {
        do {
          dirty = false;
          cursor = 0;
          current = hook();
          const pending = effects;
          effects = [];
          pending.forEach((effect) => effect());
        } while (dirty);
      };
      flush();
      return {
        get current() { return current; },
        flush,
        unmount() {
          effectSlots.forEach((index) => (slots[index] as Effect)?.cleanup?.());
        },
      };
    },
  };
};

export const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
};

export const settleAuthTasks = async () => {
  for (let i = 0; i < 12; i += 1) await Promise.resolve();
};

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
  removeItem(key: string) { this.values.delete(key); }
}

export const installAuthBrowser = () => {
  const originals = new Map<string, PropertyDescriptor | undefined>();
  const localStorage = new MemoryStorage();
  const sessionStorage = new MemoryStorage();
  const timers = new Map<number, () => void>();
  let nextTimer = 0;
  let now = 1_800_000_000_000;
  const originalNow = Date.now;
  const window = Object.assign(new EventTarget(), {
    localStorage,
    sessionStorage,
    setInterval(callback: () => void) { const id = ++nextTimer; timers.set(id, callback); return id; },
    clearInterval(id: number) { timers.delete(id); },
  });
  const document = Object.assign(new EventTarget(), { visibilityState: "visible" });
  for (const [name, value] of Object.entries({ window, document, localStorage, sessionStorage })) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }
  Date.now = () => now;
  return {
    window, document, timers,
    advance(milliseconds: number) { now += milliseconds; },
    tick() { [...timers.values()].forEach((callback) => callback()); },
    restore() {
      Date.now = originalNow;
      for (const [name, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else Reflect.deleteProperty(globalThis, name);
      }
    },
  };
};
