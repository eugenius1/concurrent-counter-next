import { NextResponse } from "next/server";
import { ulid } from "ulid";
import { db, type Counter } from "@/lib/db";
import { CREATE_LIMIT, rateLimit } from "@/lib/rateLimit";
import { rejectCrossSite } from "@/lib/sameOrigin";

export async function POST(request: Request) {
  const rejected = rejectCrossSite(request) ?? rateLimit(request, CREATE_LIMIT);
  if (rejected) return rejected;

  try {
    const sql = await db();
    const [counter] = await sql<Counter[]>`
      INSERT INTO counters (id) VALUES (${ulid()})
      RETURNING id, value
    `;
    return NextResponse.json(counter, { status: 201 });
  } catch (error) {
    console.error("Error creating counter:", error);
    return NextResponse.json(
      { error: "Failed to create counter" },
      { status: 500 },
    );
  }
}
