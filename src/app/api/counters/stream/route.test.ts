/** @jest-environment node */
import { GET } from "./route";
import { db } from "@/lib/db";
import {
  subscribeToCounters,
  type CounterSubscriber,
} from "@/lib/counterEvents";

jest.mock("@/lib/db", () => ({ db: jest.fn() }));
jest.mock("@/lib/counterEvents", () => ({ subscribeToCounters: jest.fn() }));

const id = "01HQ8XVNZ8YRTKP6QXDJ8W12N3";

describe("GET /api/counters/stream", () => {
  let subscriber: CounterSubscriber;
  let unsubscribe: jest.Mock;
  let sql: jest.Mock;

  const open = async () => {
    const abort = new AbortController();
    const request = new Request("http://localhost/api/counters/stream", {
      signal: abort.signal,
    });
    const response = await GET(request);
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
    (subscribeToCounters as jest.Mock).mockImplementation(async (s) => {
      subscriber = s;
      return unsubscribe;
    });
    sql = jest.fn().mockResolvedValue([{ count: 2 }]);
    (db as jest.Mock).mockResolvedValue(sql);
  });

  it("sends the count, and again when a counter is created", async () => {
    const { response, read, abort } = await open();

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(await read()).toBe("event: count\ndata: 2\n\n");

    sql.mockResolvedValue([{ count: 3 }]);
    subscriber.onChange({ id, value: "0", created: true });
    expect(await read()).toBe("event: count\ndata: 3\n\n");

    abort.abort();
  });

  it("sends nothing when a counter only changes value", async () => {
    const { read, abort } = await open();
    await read();

    subscriber.onChange({ id, value: "5", created: false });
    abort.abort();

    expect(await read()).toBeNull();
    expect(sql).toHaveBeenCalledTimes(1);
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

  it("ends the stream when the count can't be read", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    sql.mockRejectedValue(new Error("connection refused"));

    const { read } = await open();

    expect(await read()).toBeNull();
    expect(unsubscribe).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
