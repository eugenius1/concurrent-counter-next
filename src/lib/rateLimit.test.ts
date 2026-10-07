/** @jest-environment node */
import {
  clientKey,
  holdStream,
  MAX_STREAMS,
  rateLimit,
  type RateLimit,
} from "./rateLimit";

const from = (forwardedFor?: string) =>
  new Request("http://localhost/", {
    headers: forwardedFor ? { "X-Forwarded-For": forwardedFor } : {},
  });

describe("clientKey", () => {
  it.each([
    ["203.0.113.7", "203.0.113.7"],
    // Everything before the last entry is whatever the client sent
    ["198.51.100.1, 203.0.113.7", "203.0.113.7"],
    ["::ffff:203.0.113.7", "203.0.113.7"],
    ["2001:db8:1:2:3:4:5:6", "2001:db8:1:2"],
    ["2001:0DB8:0001:0002::1", "2001:db8:1:2"],
    ["2001:db8::1", "2001:db8:0:0"],
    ["::1", "0:0:0:0"],
  ])("counts %s as %s", (forwardedFor, key) => {
    expect(clientKey(from(forwardedFor))).toBe(key);
  });

  it("counts requests with no forwarded address together", () => {
    expect(clientKey(from())).toBe("unknown");
  });
});

describe("rateLimit", () => {
  const limit: RateLimit = { name: "test", burst: 3, perSecond: 0.5 };
  let now: number;

  beforeEach(() => {
    now = 1_000_000;
    jest.spyOn(Date, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("allows a burst, then answers 429 with when to retry", async () => {
    const request = from("203.0.113.1");

    for (let i = 0; i < limit.burst; i++) {
      expect(rateLimit(request, limit)).toBeNull();
    }
    const response = rateLimit(request, limit)!;

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("2");
  });

  it("refills as time passes", () => {
    const request = from("203.0.113.2");
    for (let i = 0; i < limit.burst; i++) rateLimit(request, limit);
    expect(rateLimit(request, limit)).not.toBeNull();

    now += 2_000;

    expect(rateLimit(request, limit)).toBeNull();
    expect(rateLimit(request, limit)).not.toBeNull();
  });

  it("counts each client and each limit separately", () => {
    for (let i = 0; i < limit.burst; i++) rateLimit(from("203.0.113.3"), limit);

    expect(rateLimit(from("203.0.113.3"), limit)).not.toBeNull();
    expect(rateLimit(from("203.0.113.4"), limit)).toBeNull();
    expect(
      rateLimit(from("203.0.113.3"), { ...limit, name: "other" }),
    ).toBeNull();
  });

  it("counts every address in an IPv6 /64 as one client", () => {
    for (let i = 0; i < limit.burst; i++) {
      rateLimit(from(`2001:db8:9:9::${i}`), limit);
    }

    expect(rateLimit(from("2001:db8:9:9::ffff"), limit)).not.toBeNull();
  });
});

describe("holdStream", () => {
  it("allows MAX_STREAMS at once and frees a place when one ends", () => {
    const request = from("203.0.113.5");
    const releases = Array.from({ length: MAX_STREAMS }, () =>
      holdStream(request),
    );

    const refused = holdStream(request);
    expect(refused).toBeInstanceOf(Response);
    expect((refused as Response).status).toBe(429);

    // Releasing twice must not free a second place
    (releases[0] as () => void)();
    (releases[0] as () => void)();

    expect(holdStream(request)).toBeInstanceOf(Function);
    expect(holdStream(request)).toBeInstanceOf(Response);
  });
});
