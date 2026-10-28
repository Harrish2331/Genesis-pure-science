import { test } from "node:test";
import assert from "node:assert/strict";
import { INTRO_FAILSAFE_MS, INTRO_KEY, INTRO_SCRIPT } from "../src/lib/intro.ts";

/** Run the inline intro script against a stubbed browser and report what it did. */
function run({ path = "/", reduced = false, stored = false, storageThrows = false } = {}) {
  const attrs = new Map<string, string>();
  const store = new Map<string, string>(stored ? [[INTRO_KEY, "1"]] : []);
  const timers: { fn: () => void; ms: number }[] = [];
  const sessionStorage = {
    getItem: (k: string) => {
      if (storageThrows) throw new Error("SecurityError");
      return store.get(k) ?? null;
    },
    setItem: (k: string, v: string) => void store.set(k, v),
  };
  const document = {
    documentElement: {
      setAttribute: (k: string, v: string) => void attrs.set(k, v),
      removeAttribute: (k: string) => void attrs.delete(k),
    },
  };
  const matchMedia = () => ({ matches: reduced });
  const window = { matchMedia };
  const setTimeout = (fn: () => void, ms: number) => timers.push({ fn, ms });
  new Function("document", "location", "sessionStorage", "window", "matchMedia", "setTimeout", INTRO_SCRIPT)(
    document,
    { pathname: path },
    sessionStorage,
    window,
    matchMedia,
    setTimeout,
  );
  return { playing: attrs.get("data-intro") === "play", stored: store.has(INTRO_KEY), timers, attrs };
}

test("intro plays on the first visit of a tab session and records it", () => {
  const r = run();
  assert.equal(r.playing, true);
  assert.equal(r.stored, true);
});

test("intro never blocks: a failsafe timer always clears it", () => {
  const r = run();
  assert.equal(r.timers.length, 1);
  assert.equal(r.timers[0].ms, INTRO_FAILSAFE_MS);
  r.timers[0].fn();
  assert.equal(r.attrs.has("data-intro"), false);
});

test("intro does not replay within the same session", () => {
  assert.equal(run({ stored: true }).playing, false);
});

test("intro is skipped for reduced motion, the dashboard, and blocked storage", () => {
  assert.equal(run({ reduced: true }).playing, false);
  assert.equal(run({ path: "/admin/notices" }).playing, false);
  assert.equal(run({ storageThrows: true }).playing, false);
});
