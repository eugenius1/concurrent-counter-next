import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  try {
    const sql = await db();
    await sql`SELECT 1`;
    return NextResponse.json({ status: "healthy", timestamp });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "unhealthy", timestamp },
      { status: 503 },
    );
  }
}
