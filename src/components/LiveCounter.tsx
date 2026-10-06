"use client";

import { useEffect, useState } from "react";
import Counter from "./Counter";

/**
 * A counter kept current by its own event stream. Without an initial value
 * it appears once the stream has sent one.
 */
export default function LiveCounter({
  id,
  initialValue,
}: {
  id: string;
  initialValue?: number;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // The stream sends the current value first, then every change.
    // EventSource reconnects on its own and receives the current value again.
    const events = new EventSource(`/api/counters/${id}/stream`);

    events.addEventListener("change", (event) => {
      setValue(JSON.parse(event.data).value);
    });

    return () => {
      events.close();
    };
  }, [id]);

  return value === undefined ? null : <Counter id={id} value={value} />;
}
