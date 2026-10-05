const HEARTBEAT_MS = 25_000;

export interface EventStream {
  send: (event: string, data: unknown) => void;
  close: () => void;
  /** Registers work to undo when the stream ends, however it ends. */
  onClose: (callback: () => void) => void;
}

/**
 * A Server-Sent Events response. `open` subscribes and sends the first event;
 * the stream ends when the client disconnects, `close` is called or `open`
 * throws. Clients reconnect on their own.
 */
export function eventStream(
  request: Request,
  open: (stream: EventStream) => Promise<void>,
): Response {
  const encoder = new TextEncoder();
  let close = () => {};

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const callbacks: (() => void)[] = [];
      const write = (text: string) => {
        if (!closed) controller.enqueue(encoder.encode(text));
      };
      // Proxies drop a connection that stays silent
      const heartbeat = setInterval(() => write(": ping\n\n"), HEARTBEAT_MS);

      close = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        callbacks.forEach((callback) => callback());
        try {
          controller.close();
        } catch {
          // Already closed by the client
        }
      };
      request.signal.addEventListener("abort", close);

      try {
        await open({
          send: (event, data) =>
            write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          close,
          // A stream that ended while `open` was still running cleans up at once
          onClose: (callback) => (closed ? callback() : callbacks.push(callback)),
        });
      } catch (error) {
        console.error("Error opening event stream:", error);
        close();
      }
    },
    cancel() {
      close();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
