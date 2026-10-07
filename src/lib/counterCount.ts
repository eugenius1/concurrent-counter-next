import { subscribeToCounters } from "./counterEvents";
import { db } from "./db";

/** The least time between two counts, however fast counters are created. */
export const RECOUNT_MS = 1_000;

export interface CountListener {
  onCount: (count: number) => void;
  /** The count couldn't be read, so this listener is no longer told of any. */
  onError: () => void;
}

interface CountState {
  listeners: Set<CountListener>;
  count?: number;
  /** The subscription to counter changes, made once and kept. */
  source?: Promise<unknown>;
  /** A count is being read. */
  reading: boolean;
  /** A count was read less than `RECOUNT_MS` ago, or is being read. */
  busy: boolean;
  /** A counter was created while busy, so the count is out of date. */
  stale: boolean;
}

// Kept on globalThis so dev-mode hot reloads reuse the same subscription
const globalForCount = globalThis as unknown as { counterCount?: CountState };

const state = () =>
  (globalForCount.counterCount ??= {
    listeners: new Set(),
    reading: false,
    busy: false,
    stale: false,
  });

async function recount() {
  const current = state();
  current.busy = true;
  current.reading = true;
  try {
    const sql = await db();
    const [{ count }] = await sql<{ count: number }[]>`
      SELECT count(*)::int AS count FROM counters
    `;
    // A burst of creates is often all counted by the first read
    if (count !== current.count) {
      current.count = count;
      current.listeners.forEach((listener) => listener.onCount(count));
    }
  } catch (error) {
    console.error("Error counting counters:", error);
    // Forgotten, so the next listener to arrive asks for it again
    current.count = undefined;
    const listeners = [...current.listeners];
    current.listeners.clear();
    listeners.forEach((listener) => listener.onError());
  }
  current.reading = false;

  setTimeout(() => {
    current.busy = false;
    if (current.stale) {
      current.stale = false;
      void recount();
    }
  }, RECOUNT_MS);
}

// Counts are read one at a time, so they can't be sent out of order, and a
// change during one is followed by another, so the last count sent is right
function invalidate() {
  const current = state();
  if (current.busy) current.stale = true;
  else void recount();
}

/**
 * Tells the listener how many counters exist, now and whenever one is
 * created; resolves to an unsubscribe function.
 *
 * Every listener shares one count. Counting per listener meant a single
 * insert ran one `count(*)` for each open homepage, so a burst of creates
 * with a few hundred visitors swamped the connection pool.
 */
export async function subscribeToCount(
  listener: CountListener,
): Promise<() => void> {
  const current = state();
  // Subscribed before the first count, so a counter created in between
  // triggers a recount instead of being missed
  current.source ??= subscribeToCounters({
    onChange: ({ created }) => {
      if (created) invalidate();
    },
    // Creations may have been missed while the listener was reconnecting
    onReset: invalidate,
  }).catch((error) => {
    current.source = undefined;
    throw error;
  });
  await current.source;

  current.listeners.add(listener);
  if (current.count !== undefined) listener.onCount(current.count);
  // A count being read reaches this listener too; otherwise ask for one
  else if (!current.reading) invalidate();

  return () => {
    current.listeners.delete(listener);
  };
}
