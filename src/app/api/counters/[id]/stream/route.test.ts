/** @jest-environment node */
import { GET } from "./route";
import { readStream, sseFrame } from "@/__tests__/readStream";
import { getCounter } from "@/lib/db";
import { MAX_STREAMS } from "@/lib/rateLimit";
import {
  subscribeToCounters,
  type CounterSubscriber,
} from "@/lib/counterEvents";

jest.mock("@/lib/db", () => ({
  ...jest.requireActual("@/lib/db"),
  getCounter: jest.fn(),
}));
jest.mock("@/lib/counterEvents", () => ({ subscribeToCounters: jest.fn() }));

const counter = { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3", value: "1" };

const change = (data: unknown) => sseFrame("change", data);

describe("GET /api/counters/:id/stream", () => {
  let subscriber: CounterSubscriber;
  let unsubscribe: jest.Mock;

  const open = async (
    id = counter.id,
    headers: Record<string, string> = {},
    { aborted = false } = {},
  ) => {
    const abort = new AbortController();
    if (aborted) abort.abort();
    const request = new Request(`http://localhost/api/counters/${id}/stream`, {
      signal: abort.signal,
      headers,
    });
    const response = await GET(request, { params: Promise.resolve({ id }) });
    return { response, read: readStream(response), abort };
  };

  beforeEach(() => {
    unsubscribe = jest.fn();
    (subscribeToCounters as jest.Mock).mockReset().mockImplementation(async (s) => {
      subscriber = s;
      return unsubscribe;
    });
    (getCounter as jest.Mock).mockReset().mockResolvedValue(counter);
  });

  it("sends the current value followed by live changes", async () => {
    const { response, read, abort } = await open();

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(await read()).toBe(change(counter));
    expect(getCounter).toHaveBeenCalledWith(counter.id);
    expect(subscriber.id).toBe(counter.id);

    subscriber.onChange({ id: counter.id, value: "5", created: false });
    expect(await read()).toBe(change({ id: counter.id, value: "5" }));

    abort.abort();
  });

  it("replays a change that arrives while the value is loading", async () => {
    let resolveQuery!: (row: unknown) => void;
    (getCounter as jest.Mock).mockReturnValue(
      new Promise((resolve) => (resolveQuery = resolve)),
    );

    const { read, abort } = await open();
    await new Promise((resolve) => setTimeout(resolve));
    subscriber.onChange({ id: counter.id, value: "2", created: false });
    resolveQuery(counter);

    expect(await read()).toBe(change(counter));
    expect(await read()).toBe(change({ id: counter.id, value: "2" }));
    abort.abort();
  });

  it("ends the stream for a counter that doesn't exist", async () => {
    (getCounter as jest.Mock).mockResolvedValue(undefined);

    const { read } = await open();

    expect(await read()).toBeNull();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("rejects an id that is not a ULID", async () => {
    const { response } = await open("not-a-ulid");

    expect(response.status).toBe(400);
    expect(subscribeToCounters).not.toHaveBeenCalled();
  });

  it("unsubscribes when the client disconnects", async () => {
    const { read, abort } = await open();
    await read();

    abort.abort();

    expect(await read()).toBeNull();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("takes no stream for a client that left before it opened", async () => {
    const client = { "X-Forwarded-For": "203.0.113.8" };
    for (let i = 0; i < MAX_STREAMS; i++) {
      await open(counter.id, client, { aborted: true });
    }

    const { response, abort } = await open(counter.id, client);

    expect(response.status).toBe(200);
    // Only the last request, which was still connected, subscribed
    expect(subscribeToCounters).toHaveBeenCalledTimes(1);
    abort.abort();
  });

  it("ends the stream when the database listener reconnects", async () => {
    const { read } = await open();
    await read();

    subscriber.onReset();

    expect(await read()).toBeNull();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("answers 429 past a client's share of streams, until one ends", async () => {
    const client = { "X-Forwarded-For": "203.0.113.9" };
    const streams = [];
    for (let i = 0; i < MAX_STREAMS; i++) {
      streams.push(await open(counter.id, client));
    }

    expect((await open(counter.id, client)).response.status).toBe(429);

    streams[0].abort.abort();
    const replacement = await open(counter.id, client);
    expect(replacement.response.status).toBe(200);

    [...streams, replacement].forEach(({ abort }) => abort.abort());
  });
});
