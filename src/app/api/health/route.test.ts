import { GET } from "./route";

describe("Health Check API", () => {
  it("should return 200 status and correct response structure", async () => {
    const response = await GET();
    const data = await response.json();

    // Check status code
    expect(response.status).toBe(200);

    // Check response structure
    expect(data).toHaveProperty("status", "healthy");
    expect(data).toHaveProperty("timestamp");

    // Verify timestamp is a valid ISO string
    expect(() => new Date(data.timestamp)).not.toThrow();
    expect(data.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
  });
});
