/** @jest-environment node */
import { GET } from "./route";
import { db } from "@/lib/db";
import {
  subscribeToCounters,
  type CounterSubscriber,
} from "@/lib/counterEvents";

jest.mock("@/lib/db", () => ({
  ...jest.requireActual("@/lib/db"),
  db: jest.fn(),
}));
jest.mock("@/lib/counterEvents", () => ({ subscribeToCounters: jest.fn() }));

const counter = { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3", value: "1" };
const otherId = "01HQ8XVNZ8YRTKP6QXDJ8W12N4";

const change = (data: unknown) =>
  `event: change\ndata: ${JSON.stringify(data)}\n\n`;

describe("GET /api/counters/:id/stream", () => {
  let subscriber: CounterSubscriber;
  let unsubscribe: jest.Mock;
  let sql: jest.Mock;

  const open = async (id = counter.id) => {
    const abort = new AbortController();
    const request = new Request(`http://localhost/api/counters/${id}/stream`, {
      signal: abort.signal,
    });
    const response = await GET(request, { params: Promise.resolve({ id }) });
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const read = async () => {
      const { value, done } = await reader.read();
      return done ? null : decoder.decode(value);
    };
    return { response, read, abort };
  };

  beforeEach(() => {
    unsubscribe = jest.fn();
    (subscribeToCounters as jest.Mock).mockReset().mockImplementation(async (s) => {
      subscriber = s;
      return unsubscribe;
    });
    sql = jest.fn().mockResolvedValue([counter]);
    (db as jest.Mock).mockResolvedValue(sql);
  });

  it("sends the current value followed by live changes", async () => {
    const { response, read, abort } = await open();

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(await read()).toBe(change(counter));
    expect(sql.mock.calls[0]).toContain(counter.id);

    subscriber.onChange({ id: counter.id, value: "5", created: false });
    expect(await read()).toBe(change({ id: counter.id, value: "5" }));

    abort.abort();
  });

  it("ignores changes to other counters", async () => {
    const { read, abort } = await open();
    await read();

    subscriber.onChange({ id: otherId, value: "9", created: false });
    subscriber.onChange({ id: counter.id, value: "2", created: false });

    expect(await read()).toBe(change({ id: counter.id, value: "2" }));
    abort.abort();
  });

  it("replays a change that arrives while the value is loading", async () => {
    let resolveQuery!: (rows: unknown[]) => void;
    sql.mockReturnValue(new Promise((resolve) => (resolveQuery = resolve)));

    const { read, abort } = await open();
    await new Promise((resolve) => setTimeout(resolve));
    subscriber.onChange({ id: counter.id, value: "2", created: false });
    resolveQuery([counter]);

    expect(await read()).toBe(change(counter));
    expect(await read()).toBe(change({ id: counter.id, value: "2" }));
    abort.abort();
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

  it("ends the stream when the database listener reconnects", async () => {
    const { read } = await open();
    await read();

    subscriber.onReset();

    expect(await read()).toBeNull();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
