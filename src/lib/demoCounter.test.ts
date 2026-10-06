/** @jest-environment node */
import { readFileSync } from "node:fs";
import path from "node:path";
import { isCounterId } from "./db";
import { DEMO_COUNTER_ID } from "./demoCounter";

describe("DEMO_COUNTER_ID", () => {
  it("is a valid counter id", () => {
    expect(isCounterId(DEMO_COUNTER_ID)).toBe(true);
  });

  it("is seeded by the schema, without failing on a second run", () => {
    const schema = readFileSync(
      path.join(process.cwd(), "db", "schema.sql"),
      "utf8",
    );

    expect(schema).toContain(`VALUES ('${DEMO_COUNTER_ID}')`);
    expect(schema).toMatch(/ON CONFLICT \(id\)\s+DO NOTHING/);
  });
});
