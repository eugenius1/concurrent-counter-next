"use client";

import { useEffect, useRef } from "react";

/**
 * Passes each `event` from a Server-Sent Events URL to `onData`, parsed.
 * EventSource reconnects on its own, and each stream starts with the current
 * state, so a reconnect needs nothing from the caller.
 */
export function useEventStream<T>(
  url: string,
  event: string,
  onData: (data: T) => void,
) {
  // The latest callback, so a new one each render doesn't reopen the stream
  const latest = useRef(onData);
  useEffect(() => {
    latest.current = onData;
  });

  useEffect(() => {
    const events = new EventSource(url);
    events.addEventListener(event, (message) => {
      latest.current(JSON.parse(message.data));
    });
    return () => events.close();
  }, [url, event]);
}
