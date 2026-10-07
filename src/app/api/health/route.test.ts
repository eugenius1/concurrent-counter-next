/** @jest-environment node */
import { GET } from "./route";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({ db: jest.fn() }));

describe("Health Check API", () => {
  it("should return 200 status and correct response structure", async () => {
    (db as jest.Mock).mockResolvedValue(jest.fn().mockResolvedValue([]));

    const response = await GET();
    const data = await response.json();

    // Check status code
    expect(response.status).toBe(200);

    // Check response structure
    expect(data).toHaveProperty("status", "healthy");
    expect(data).toHaveProperty("timestamp");

    // Verify timestamp is a valid ISO string
    expect(data.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  it("should return 503 when the database is unreachable", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    (db as jest.Mock).mockRejectedValue(new Error("connection refused"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toHaveProperty("status", "unhealthy");

    consoleSpy.mockRestore();
  });
});
