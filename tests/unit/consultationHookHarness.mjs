// Deterministic hook/effect scheduler: run the real consultation hooks and API
// adapter without adding a renderer dependency to the application's package.
let currentRunner;
let currentEnvironment;

const sameDependencies = (left, right) =>
  left !== undefined && right !== undefined &&
  left.length === right.length && left.every((value, index) => Object.is(value, right[index]));

export const useState = (initial) => {
  const runner = currentRunner;
  const index = runner.cursor++;
  if (!(index in runner.slots)) {
    runner.slots[index] = typeof initial === "function" ? initial() : initial;
  }
  return [runner.slots[index], (update) => {
    if (!runner.active) return;
    const next = typeof update === "function" ? update(runner.slots[index]) : update;
    if (!Object.is(next, runner.slots[index])) {
      runner.slots[index] = next;
      runner.dirty = true;
    }
  }];
};

export const useRef = (initial) => {
  const runner = currentRunner;
  const index = runner.cursor++;
  if (!(index in runner.slots)) runner.slots[index] = { current: initial };
  return runner.slots[index];
};

const memoize = (create, dependencies) => {
  const runner = currentRunner;
  const index = runner.cursor++;
  const previous = runner.slots[index];
  if (!previous || !sameDependencies(previous.dependencies, dependencies)) {
    runner.slots[index] = { value: create(), dependencies };
  }
  return runner.slots[index].value;
};

export const useMemo = memoize;
export const useCallback = (callback, dependencies) => memoize(() => callback, dependencies);

export const useEffect = (create, dependencies) => {
  const runner = currentRunner;
  const index = runner.cursor++;
  const previous = runner.slots[index];
  if (!previous || !sameDependencies(previous.dependencies, dependencies)) {
    runner.effects.push(() => {
      previous?.cleanup?.();
      runner.slots[index] = { dependencies, cleanup: create() };
    });
  }
};

export const getSession = () => ({ userId: 12, email: "student@example.test" });
export const useRouter = () => currentEnvironment.router;
export const requestWithSession = (path, init) => currentEnvironment.request(path, init);

export const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
};

export const createConsultationEnvironment = (request) => {
  const values = new Map();
  const timers = new Map();
  const runners = [];
  let nextTimer = 0;
  const schedule = (callback, delay, interval = false) => {
    const id = ++nextTimer;
    timers.set(id, { callback, due: Date.now() + delay, delay, interval });
    return id;
  };
  const environment = {
    request,
    navigations: [],
    router: { push: (path) => environment.navigations.push(path) },
    storage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
    mount(hook) {
      const runner = {
        slots: [], cursor: 0, effects: [], dirty: true, active: true, value: undefined,
        flush() {
          for (let count = 0; this.dirty; count++) {
            if (count > 100) throw new Error("Consultation hook did not settle");
            this.dirty = false;
            this.cursor = 0;
            this.effects = [];
            currentRunner = runner;
            this.value = hook();
            currentRunner = undefined;
            for (const effect of this.effects) effect();
          }
        },
        unmount() {
          this.active = false;
          for (const slot of this.slots) slot?.cleanup?.();
        },
      };
      runners.push(runner);
      runner.flush();
      return runner;
    },
    async settle() {
      // Include chained promise continuations and the availability microtask.
      for (let turn = 0; turn < 12; turn++) {
        await Promise.resolve();
        for (const runner of runners) if (runner.active) runner.flush();
      }
    },
    async runDueTimers() {
      for (const [id, timer] of [...timers]) {
        if (!timers.has(id) || timer.due > Date.now()) continue;
        if (timer.interval) timer.due = Date.now() + timer.delay;
        else timers.delete(id);
        timer.callback();
        await this.settle();
      }
    },
    dispose() {
      for (const runner of runners) runner.unmount();
      timers.clear();
      delete globalThis.window;
      delete globalThis.document;
    },
  };
  currentEnvironment = environment;
  globalThis.window = {
    sessionStorage: environment.storage,
    setTimeout: (callback, delay) => schedule(callback, delay),
    clearTimeout: (id) => timers.delete(id),
    setInterval: (callback, delay) => schedule(callback, delay, true),
    clearInterval: (id) => timers.delete(id),
    requestAnimationFrame: (callback) => schedule(callback, 0),
  };
  globalThis.document = { querySelector: () => null };
  return environment;
};
