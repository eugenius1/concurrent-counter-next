import { subscribeToCounters } from "@/lib/counterEvents";
import { db } from "@/lib/db";
import { eventStream } from "@/lib/eventStream";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events for the homepage: a `count` with the number of counters,
 * sent again whenever one is created. It never names a counter, because a
 * counter is reachable only by its link.
 */
export async function GET(request: Request) {
  return eventStream(request, async ({ send, close, onClose }) => {
    // Counts are read one at a time so they can't be sent out of order
    let queue = Promise.resolve();
    const sendCount = () => {
      queue = queue
        .then(async () => {
          const sql = await db();
          const [{ count }] = await sql<{ count: number }[]>`
            SELECT count(*)::int AS count FROM counters
          `;
          send("count", count);
        })
        .catch((error) => {
          console.error("Error counting counters:", error);
          close();
        });
      return queue;
    };

    // Subscribed before the first count, so a counter created in between
    // triggers a recount instead of being missed
    onClose(
      await subscribeToCounters({
        onChange: ({ created }) => {
          if (created) void sendCount();
        },
        onReset: close,
      }),
    );
    await sendCount();
  });
}
