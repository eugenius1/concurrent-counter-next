/** @jest-environment node */
import { POST } from "./route";
import { db } from "@/lib/db";
import { CREATE_LIMIT } from "@/lib/rateLimit";

jest.mock("@/lib/db", () => ({ db: jest.fn() }));
jest.mock("ulid", () => ({ ulid: () => "01HQ8XVNZ8YRTKP6QXDJ8W12N3" }));

const create = (headers: Record<string, string> = {}) =>
  POST(
    new Request("http://localhost/api/counters", { method: "POST", headers }),
  );

describe("POST /api/counters", () => {
  beforeEach(() => {
    (db as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a counter with a generated id", async () => {
    const counter = { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3", value: "0" };
    const sql = jest.fn().mockResolvedValue([counter]);
    (db as jest.Mock).mockResolvedValue(sql);

    const response = await create();

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(counter);
    expect(sql.mock.calls[0]).toContain(counter.id);
  });

  it("returns 500 when the insert fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    (db as jest.Mock).mockRejectedValue(new Error("connection refused"));

    const response = await create();

    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });

  it("rejects a request sent from another site", async () => {
    const response = await create({ "Sec-Fetch-Site": "cross-site" });

    expect(response.status).toBe(403);
    expect(db).not.toHaveBeenCalled();
  });

  it("answers 429 once a client has created its share", async () => {
    const sql = jest.fn().mockResolvedValue([{ id: "x", value: "0" }]);
    (db as jest.Mock).mockResolvedValue(sql);
    const client = { "X-Forwarded-For": "203.0.113.9" };
    // The bucket refills as time passes, so the clock the limiter reads
    // stands still
    jest.spyOn(Date, "now").mockReturnValue(Date.now());

    for (let i = 0; i < CREATE_LIMIT.burst; i++) {
      expect((await create(client)).status).toBe(201);
    }
    const response = await create(client);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(sql).toHaveBeenCalledTimes(CREATE_LIMIT.burst);
  });
});
