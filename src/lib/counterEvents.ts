import { db, type Counter } from "./db";

export interface CounterSubscriber {
  onChange: (counter: Counter) => void;
  /** The database listener reconnected, so changes may have been missed. */
  onReset: () => void;
}

const CHANNEL = "counter_changes";

// Kept on globalThis so dev-mode hot reloads reuse the same listener
const globalForEvents = globalThis as unknown as {
  counterSubscribers?: Set<CounterSubscriber>;
  counterListener?: Promise<unknown>;
};

const subscribers = (globalForEvents.counterSubscribers ??= new Set());

async function listen() {
  const sql = await db();
  let listening = false;
  await sql.listen(
    CHANNEL,
    (payload) => {
      const counter = JSON.parse(payload) as Counter;
      subscribers.forEach((subscriber) => subscriber.onChange(counter));
    },
    () => {
      // Called on the first listen and again after every reconnect
      if (listening) {
        [...subscribers].forEach((subscriber) => subscriber.onReset());
      }
      listening = true;
    },
  );
}

/** Subscribes to counter changes; resolves to an unsubscribe function. */
export async function subscribeToCounters(
  subscriber: CounterSubscriber,
): Promise<() => void> {
  subscribers.add(subscriber);
  try {
    // One LISTEN connection is shared by every open stream
    globalForEvents.counterListener ??= listen();
    await globalForEvents.counterListener;
  } catch (error) {
    globalForEvents.counterListener = undefined;
    subscribers.delete(subscriber);
    throw error;
  }
  return () => {
    subscribers.delete(subscriber);
  };
}
