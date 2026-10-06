import { subscribeToCount } from "@/lib/counterCount";
import { eventStream } from "@/lib/eventStream";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events for the homepage: a `count` with the number of counters,
 * sent again whenever one is created. It never names a counter, because a
 * counter is reachable only by its link.
 */
export async function GET(request: Request) {
  return eventStream(request, async ({ send, close, onClose }) => {
    onClose(
      await subscribeToCount({
        onCount: (count) => send("count", count),
        onError: close,
      }),
    );
  });
}
