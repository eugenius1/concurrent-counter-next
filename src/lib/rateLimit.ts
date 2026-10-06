import { NextResponse } from "next/server";

/** A token bucket: `burst` requests at once, refilled at `perSecond`. */
export interface RateLimit {
  name: string;
  burst: number;
  perSecond: number;
}

// Each insert is a row kept forever, so creating is the tightest limit
export const CREATE_LIMIT: RateLimit = {
  name: "create",
  burst: 5,
  perSecond: 5 / 60,
};

// Above what a person can press, with room for several people on one network
export const INCREMENT_LIMIT: RateLimit = {
  name: "increment",
  burst: 20,
  perSecond: 10,
};

/**
 * Open event streams allowed per client. A room of people on one network
 * shares an address and each tab holds up to two streams, so this is far
 * above one person's use and far below what would exhaust the server.
 */
export const MAX_STREAMS = 40;

const SWEEP_MS = 60_000;

interface Bucket {
  tokens: number;
  updatedAt: number;
  /** When the bucket is full again and no longer worth keeping. */
  fullAt: number;
}

// Kept on globalThis so dev-mode hot reloads keep counting
const globalForLimits = globalThis as unknown as {
  rateLimits?: {
    buckets: Map<string, Bucket>;
    streams: Map<string, number>;
    sweptAt: number;
  };
};

const limits = (globalForLimits.rateLimits ??= {
  buckets: new Map(),
  streams: new Map(),
  sweptAt: 0,
});

/**
 * Who a request is counted against. There are no accounts, so this is the
 * network address: an IPv4 address, or the /64 of an IPv6 one, because a
 * single IPv6 subscriber is handed a whole /64 to pick addresses from.
 */
export function clientKey(request: Request): string {
  // Each proxy appends the address it saw, so the last entry is the only one
  // the client can't write itself
  const address = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .at(-1)
    ?.trim()
    .toLowerCase();
  if (!address) return "unknown";
  if (!address.includes(":")) return address;

  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(address);
  if (mapped) return mapped[1];

  const [head, tail] = address.split("::");
  const before = head ? head.split(":") : [];
  const after = tail ? tail.split(":") : [];
  const groups =
    tail === undefined
      ? before
      : [
          ...before,
          ...Array<string>(Math.max(0, 8 - before.length - after.length)).fill(
            "0",
          ),
          ...after,
        ];
  return groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, ""))
    .join(":");
}

function tooManyRequests(retryAfterSeconds: number): Response {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

/** Takes one token from the client's bucket; a 429 if it is empty, else null. */
export function rateLimit(
  request: Request,
  { name, burst, perSecond }: RateLimit,
): Response | null {
  const now = Date.now();
  if (now - limits.sweptAt >= SWEEP_MS) {
    // Without this every address ever seen would stay in memory
    limits.sweptAt = now;
    limits.buckets.forEach((bucket, key) => {
      if (bucket.fullAt <= now) limits.buckets.delete(key);
    });
  }

  const key = `${name}:${clientKey(request)}`;
  const bucket = limits.buckets.get(key) ?? {
    tokens: burst,
    updatedAt: now,
    fullAt: now,
  };
  bucket.tokens = Math.min(
    burst,
    bucket.tokens + ((now - bucket.updatedAt) / 1000) * perSecond,
  );
  bucket.updatedAt = now;

  const allowed = bucket.tokens >= 1;
  if (allowed) bucket.tokens -= 1;
  bucket.fullAt = now + ((burst - bucket.tokens) / perSecond) * 1000;
  limits.buckets.set(key, bucket);

  return allowed
    ? null
    : tooManyRequests(Math.ceil((1 - bucket.tokens) / perSecond));
}

/**
 * Counts an event stream against the client. Returns the function that gives
 * the place back when the stream ends, or a 429 if the client has
 * `MAX_STREAMS` open already.
 */
export function holdStream(request: Request): (() => void) | Response {
  const key = clientKey(request);
  const open = limits.streams.get(key) ?? 0;
  if (open >= MAX_STREAMS) return tooManyRequests(10);
  limits.streams.set(key, open + 1);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const left = (limits.streams.get(key) ?? 1) - 1;
    if (left > 0) limits.streams.set(key, left);
    else limits.streams.delete(key);
  };
}
