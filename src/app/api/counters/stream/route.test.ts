/** @jest-environment node */
import { GET } from "./route";
import { db } from "@/lib/db";
import {
  subscribeToCounters,
  type CounterSubscriber,
} from "@/lib/counterEvents";

jest.mock("@/lib/db", () => ({ db: jest.fn() }));
jest.mock("@/lib/counterEvents", () => ({ subscribeToCounters: jest.fn() }));

const counters = [
  { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3", value: 1 },
  { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N4", value: 2 },
];

describe("GET /api/counters/stream", () => {
  let subscriber: CounterSubscriber;
  let unsubscribe: jest.Mock;

  const open = () => {
    const abort = new AbortController();
    const request = new Request("http://localhost/api/counters/stream", {
      signal: abort.signal,
    });
    return GET(request).then((response) => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      const read = async () => {
        const { value, done } = await reader.read();
        return done ? null : decoder.decode(value);
      };
      return { response, read, abort };
    });
  };

  beforeEach(() => {
    unsubscribe = jest.fn();
    (subscribeToCounters as jest.Mock).mockImplementation(async (s) => {
      subscriber = s;
      return unsubscribe;
    });
    (db as jest.Mock).mockResolvedValue(jest.fn().mockResolvedValue(counters));
  });

  it("sends a snapshot followed by live changes", async () => {
    const { response, read, abort } = await open();

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(await read()).toBe(
      `event: snapshot\ndata: ${JSON.stringify(counters)}\n\n`,
    );

    const changed = { id: counters[0].id, value: 5 };
    subscriber.onChange(changed);
    expect(await read()).toBe(
      `event: change\ndata: ${JSON.stringify(changed)}\n\n`,
    );

    abort.abort();
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
