import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

export interface Counter {
  id: string; // ULID is a string
  // A 64-bit integer in decimal: it can exceed what a JS number holds exactly,
  // so it stays a string from the database to the page
  value: string;
}

type Sql = ReturnType<typeof postgres>;

// Kept on globalThis so dev-mode hot reloads reuse the same pool
const globalForDb = globalThis as unknown as {
  sql?: Sql;
  schemaReady?: Promise<void>;
};

function getSql(): Sql {
  if (!globalForDb.sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    globalForDb.sql = postgres(url, {
      max: 5,
      connect_timeout: 5,
      onnotice: () => {},
    });
  }
  return globalForDb.sql;
}

async function applySchema(sql: Sql) {
  const schema = await readFile(
    path.join(process.cwd(), "db", "schema.sql"),
    "utf8",
  );
  await sql.begin(async (tx) => {
    // Serialise concurrent app instances starting at the same time
    await tx`SELECT pg_advisory_xact_lock(hashtext('counter_schema'))`;
    await tx.unsafe(schema);
  });
}

/** Returns the client once the schema is in place. */
export async function db(): Promise<Sql> {
  const sql = getSql();
  if (!globalForDb.schemaReady) {
    globalForDb.schemaReady = applySchema(sql).catch((error) => {
      // Retry on the next call rather than caching the failure
      globalForDb.schemaReady = undefined;
      throw error;
    });
  }
  await globalForDb.schemaReady;
  return sql;
}

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export function isCounterId(id: string): boolean {
  return ULID_PATTERN.test(id);
}
