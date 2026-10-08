/** @jest-environment node */
import { POST } from "./route";
import { db } from "@/lib/db";
import { INCREMENT_LIMIT } from "@/lib/rateLimit";

jest.mock("@/lib/db", () => ({
  ...jest.requireActual("@/lib/db"),
  db: jest.fn(),
}));

const id = "01HQ8XVNZ8YRTKP6QXDJ8W12N3";

const increment = (
  counterId: string,
  body: unknown,
  headers: Record<string, string> = {},
) =>
  POST(
    new Request(`http://localhost/api/counters/${counterId}/increment`, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    }),
    { params: Promise.resolve({ id: counterId }) },
  );

describe("POST /api/counters/[id]/increment", () => {
  let sql: jest.Mock;

  beforeEach(() => {
    sql = jest.fn().mockResolvedValue([{ id, value: "43" }]);
    (db as jest.Mock).mockResolvedValue(sql);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([1, -1])("applies an increment of %d", async (by) => {
    const response = await increment(id, { by });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id, value: "43" });
    expect(sql.mock.calls[0]).toEqual(expect.arrayContaining([by, id]));
  });

  it.each([[{ by: 2 }], [{ by: "1" }], [{}], [null]])(
    "rejects the body %j",
    async (body) => {
      const response = await increment(id, body);

      expect(response.status).toBe(400);
      expect(sql).not.toHaveBeenCalled();
    },
  );

  it("rejects an id that is not a ULID", async () => {
    const response = await increment("not-a-ulid", { by: 1 });

    expect(response.status).toBe(400);
    expect(sql).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown counter", async () => {
    sql.mockResolvedValue([]);

    const response = await increment(id, { by: 1 });

    expect(response.status).toBe(404);
  });

  it("rejects a request sent from another site", async () => {
    const response = await increment(
      id,
      { by: 1 },
      { Origin: "https://evil.example", Host: "localhost" },
    );

    expect(response.status).toBe(403);
    expect(sql).not.toHaveBeenCalled();
  });

  it("answers 429 once a client has used its burst", async () => {
    const client = { "X-Forwarded-For": "203.0.113.9" };
    // The bucket refills a token every 100 ms, which a loaded machine can
    // spend between requests, so the clock the limiter reads stands still
    jest.spyOn(Date, "now").mockReturnValue(Date.now());

    for (let i = 0; i < INCREMENT_LIMIT.burst; i++) {
      expect((await increment(id, { by: 1 }, client)).status).toBe(200);
    }
    const response = await increment(id, { by: 1 }, client);

    expect(response.status).toBe(429);
    expect(sql).toHaveBeenCalledTimes(INCREMENT_LIMIT.burst);
  });
});
