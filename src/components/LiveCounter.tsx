"use client";

import { useState } from "react";
import Counter from "./Counter";
import { useEventStream } from "./useEventStream";

/**
 * A counter kept current by its own event stream. Without an initial value
 * it appears once the stream has sent one.
 */
export default function LiveCounter({
  id,
  initialValue,
}: {
  id: string;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);

  // The current value first, then every change
  useEventStream<{ value: string }>(
    `/api/counters/${id}/stream`,
    "change",
    (change) => setValue(change.value),
  );

  return value === undefined ? null : <Counter id={id} value={value} />;
}
