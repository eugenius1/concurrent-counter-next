/** @jest-environment node */
import { POST } from "./route";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  ...jest.requireActual("@/lib/db"),
  db: jest.fn(),
}));

const id = "01HQ8XVNZ8YRTKP6QXDJ8W12N3";

const increment = (counterId: string, body: unknown) =>
  POST(
    new Request(`http://localhost/api/counters/${counterId}/increment`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: counterId }) },
  );

describe("POST /api/counters/[id]/increment", () => {
  let sql: jest.Mock;

  beforeEach(() => {
    sql = jest.fn().mockResolvedValue([{ id, value: 43 }]);
    (db as jest.Mock).mockResolvedValue(sql);
  });

  it.each([1, -1])("applies an increment of %d", async (by) => {
    const response = await increment(id, { by });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id, value: 43 });
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
});
