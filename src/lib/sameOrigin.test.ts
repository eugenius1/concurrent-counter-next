/** @jest-environment node */
import { rejectCrossSite } from "./sameOrigin";

const post = (headers: Record<string, string>) =>
  new Request("http://localhost/api/counters", {
    method: "POST",
    headers: { Host: "counter.example", ...headers },
  });

describe("rejectCrossSite", () => {
  it.each([
    [{ "Sec-Fetch-Site": "same-origin" }],
    [{ Origin: "https://counter.example" }],
    // Not a browser: nothing to protect, and the rate limit still applies
    [{}],
  ])("allows %j", (headers) => {
    expect(rejectCrossSite(post(headers))).toBeNull();
  });

  it.each([
    [{ "Sec-Fetch-Site": "cross-site" }],
    // Another subdomain is another app
    [{ "Sec-Fetch-Site": "same-site" }],
    [{ "Sec-Fetch-Site": "cross-site", Origin: "https://counter.example" }],
    [{ Origin: "https://evil.example" }],
    [{ Origin: "null" }],
  ])("rejects %j", (headers) => {
    expect(rejectCrossSite(post(headers))?.status).toBe(403);
  });
});
