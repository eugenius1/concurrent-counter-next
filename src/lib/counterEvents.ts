import { db, type Counter } from "./db";

export interface CounterChange extends Counter {
  /** True for a new counter, false for a changed value. */
  created: boolean;
}

export interface CounterSubscriber {
  /** Only this counter's changes are sent; without it, every counter's. */
  id?: string;
  onChange: (change: CounterChange) => void;
  /** The database listener reconnected, so changes may have been missed. */
  onReset: () => void;
}

const CHANNEL = "counter_changes";

// Kept on globalThis so dev-mode hot reloads reuse the same listener
const globalForEvents = globalThis as unknown as {
  counterSubscribersById?: Map<string | undefined, Set<CounterSubscriber>>;
  counterListener?: Promise<unknown>;
};

// Keyed by counter id, so a change wakes only the streams for that counter
// (plus those that want every change) rather than every open stream
const subscribers = (globalForEvents.counterSubscribersById ??= new Map());

function add(subscriber: CounterSubscriber) {
  const set = subscribers.get(subscriber.id) ?? new Set();
  subscribers.set(subscriber.id, set.add(subscriber));
}

function remove(subscriber: CounterSubscriber) {
  const set = subscribers.get(subscriber.id);
  set?.delete(subscriber);
  if (set?.size === 0) subscribers.delete(subscriber.id);
}

// One stream that fails to take an event must not keep it from the rest
function isolated(notify: () => void) {
  try {
    notify();
  } catch (error) {
    console.error("Error notifying a counter subscriber:", error);
  }
}

async function listen() {
  const sql = await db();
  let listening = false;
  await sql.listen(
    CHANNEL,
    (payload) => {
      const change = JSON.parse(payload) as CounterChange;
      [
        ...(subscribers.get(change.id) ?? []),
        ...(subscribers.get(undefined) ?? []),
      ].forEach((subscriber) => isolated(() => subscriber.onChange(change)));
    },
    () => {
      // Called on the first listen and again after every reconnect
      if (listening) {
        [...subscribers.values()]
          .flatMap((set) => [...set])
          .forEach((subscriber) => isolated(() => subscriber.onReset()));
      }
      listening = true;
    },
  );
}

/** Subscribes to counter changes; resolves to an unsubscribe function. */
export async function subscribeToCounters(
  subscriber: CounterSubscriber,
): Promise<() => void> {
  add(subscriber);
  try {
    // One LISTEN connection is shared by every open stream
    globalForEvents.counterListener ??= listen();
    await globalForEvents.counterListener;
  } catch (error) {
    globalForEvents.counterListener = undefined;
    remove(subscriber);
    throw error;
  }
  return () => remove(subscriber);
}
