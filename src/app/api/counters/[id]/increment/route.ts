import { NextResponse } from "next/server";
import { db, isCounterId, type Counter } from "@/lib/db";
import { INCREMENT_LIMIT, rateLimit } from "@/lib/rateLimit";
import { rejectCrossSite } from "@/lib/sameOrigin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rejected =
    rejectCrossSite(request) ?? rateLimit(request, INCREMENT_LIMIT);
  if (rejected) return rejected;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const by = body?.by;

  if (!isCounterId(id) || (by !== 1 && by !== -1)) {
    return NextResponse.json(
      { error: "Expected a counter id and a body of { by: 1 } or { by: -1 }" },
      { status: 400 },
    );
  }

  try {
    const sql = await db();
    // A single UPDATE keeps concurrent increments atomic
    const [counter] = await sql<Counter[]>`
      UPDATE counters SET value = value + ${by}
      WHERE id = ${id}
      RETURNING id, value
    `;
    if (!counter) {
      return NextResponse.json({ error: "Counter not found" }, { status: 404 });
    }
    return NextResponse.json(counter);
  } catch (error) {
    console.error("Error updating counter:", error);
    return NextResponse.json(
      { error: "Failed to update counter" },
      { status: 500 },
    );
  }
}
