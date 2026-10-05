import { subscribeToCounters } from "@/lib/counterEvents";
import { db, type Counter } from "@/lib/db";

export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 25_000;

/**
 * Server-Sent Events: a `snapshot` of every counter, then a `change` for each
 * insert or update. Clients reconnect on their own and get a fresh snapshot.
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (text: string) => {
        if (!closed) controller.enqueue(encoder.encode(text));
      };
      const sendEvent = (event: string, data: unknown) =>
        send(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

      // Changes that arrive while the snapshot is loading are replayed after it
      let pending: Counter[] | null = [];
      let unsubscribe = () => {};
      const heartbeat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);

      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed by the client
        }
      };
      request.signal.addEventListener("abort", cleanup);

      try {
        unsubscribe = await subscribeToCounters({
          onChange: (counter) =>
            pending ? pending.push(counter) : sendEvent("change", counter),
          onReset: cleanup,
        });
        if (closed) return unsubscribe();

        const sql = await db();
        const counters = await sql<Counter[]>`
          SELECT id, value FROM counters ORDER BY id
        `;
        sendEvent("snapshot", counters);
        pending.forEach((counter) => sendEvent("change", counter));
        pending = null;
      } catch (error) {
        console.error("Error streaming counters:", error);
        cleanup();
      }
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
