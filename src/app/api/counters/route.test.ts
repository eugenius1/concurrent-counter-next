/** @jest-environment node */
import { POST } from "./route";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({ db: jest.fn() }));
jest.mock("ulid", () => ({ ulid: () => "01HQ8XVNZ8YRTKP6QXDJ8W12N3" }));

describe("POST /api/counters", () => {
  it("creates a counter with a generated id", async () => {
    const counter = { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3", value: 0 };
    const sql = jest.fn().mockResolvedValue([counter]);
    (db as jest.Mock).mockResolvedValue(sql);

    const response = await POST();

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(counter);
    expect(sql.mock.calls[0]).toContain(counter.id);
  });

  it("returns 500 when the insert fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    (db as jest.Mock).mockRejectedValue(new Error("connection refused"));

    const response = await POST();

    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });
});
