import { NextResponse } from "next/server";
import { subscribeToCounters } from "@/lib/counterEvents";
import { db, isCounterId, type Counter } from "@/lib/db";
import { eventStream } from "@/lib/eventStream";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events for one counter: a `change` with its current value, then
 * another for each update.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isCounterId(id)) {
    return NextResponse.json({ error: "Expected a counter id" }, { status: 400 });
  }

  return eventStream(request, async ({ send, close, onClose }) => {
    const sendChange = ({ id, value }: Counter) =>
      send("change", { id, value });

    // Changes that arrive while the current value is loading are replayed
    // after it
    let pending: Counter[] | null = [];
    onClose(
      await subscribeToCounters({
        onChange: (change) => {
          if (change.id !== id) return;
          if (pending) pending.push(change);
          else sendChange(change);
        },
        onReset: close,
      }),
    );

    const sql = await db();
    const [counter] = await sql<Counter[]>`
      SELECT id, value FROM counters WHERE id = ${id}
    `;
    if (counter) sendChange(counter);
    pending.forEach(sendChange);
    pending = null;
  });
}
