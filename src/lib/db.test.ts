/** @jest-environment node */
import postgres from "postgres";
import { readFile } from "node:fs/promises";

jest.mock("postgres", () => jest.fn());
jest.mock("node:fs/promises", () => ({ readFile: jest.fn() }));

const counter = { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3", value: "1" };

describe("db", () => {
  let sql: jest.Mock & { begin: jest.Mock };
  let tx: jest.Mock & { unsafe: jest.Mock };

  // A fresh module and globalThis each time, as on a cold start
  const load = async () => {
    delete (globalThis as { sql?: unknown }).sql;
    delete (globalThis as { schemaReady?: unknown }).schemaReady;
    let mod!: typeof import("./db");
    await jest.isolateModulesAsync(async () => {
      mod = await import("./db");
    });
    return mod;
  };

  beforeEach(() => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    tx = Object.assign(jest.fn().mockResolvedValue([]), {
      unsafe: jest.fn().mockResolvedValue([]),
    });
    sql = Object.assign(jest.fn().mockResolvedValue([counter]), {
      begin: jest.fn(async (run: (t: typeof tx) => Promise<void>) => run(tx)),
    });
    (postgres as unknown as jest.Mock).mockReset().mockReturnValue(sql);
    (readFile as jest.Mock).mockReset().mockResolvedValue("CREATE …");
  });

  it("applies the schema once, however many callers", async () => {
    const { db } = await load();

    await Promise.all([db(), db()]);
    await db();

    expect(postgres).toHaveBeenCalledTimes(1);
    expect(tx.unsafe).toHaveBeenCalledTimes(1);
    expect(tx.unsafe).toHaveBeenCalledWith("CREATE …");
  });

  it("tries the schema again after it failed", async () => {
    const { db } = await load();
    tx.unsafe.mockRejectedValueOnce(new Error("connection refused"));

    await expect(db()).rejects.toThrow("connection refused");
    await db();

    expect(tx.unsafe).toHaveBeenCalledTimes(2);
  });

  it("refuses to connect without DATABASE_URL", async () => {
    delete process.env.DATABASE_URL;
    const { db } = await load();

    await expect(db()).rejects.toThrow("DATABASE_URL is not set");
  });

  it("looks up one counter by id", async () => {
    const { getCounter } = await load();

    expect(await getCounter(counter.id)).toEqual(counter);
    expect(sql.mock.calls[0]).toContain(counter.id);
  });

  it("finds nothing for an id with no counter", async () => {
    const { getCounter } = await load();
    sql.mockResolvedValue([]);

    expect(await getCounter(counter.id)).toBeUndefined();
  });
});
