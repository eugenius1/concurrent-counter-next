/** @jest-environment node */
import { GET } from "./route";
import { readStream, sseFrame } from "@/__tests__/readStream";
import { subscribeToCount, type CountListener } from "@/lib/counterCount";

jest.mock("@/lib/counterCount", () => ({ subscribeToCount: jest.fn() }));

describe("GET /api/counters/stream", () => {
  let listener: CountListener;
  let unsubscribe: jest.Mock;

  const open = async () => {
    const abort = new AbortController();
    const request = new Request("http://localhost/api/counters/stream", {
      signal: abort.signal,
    });
    const response = await GET(request);
    return { response, read: readStream(response), abort };
  };

  beforeEach(() => {
    unsubscribe = jest.fn();
    (subscribeToCount as jest.Mock).mockImplementation(async (l) => {
      listener = l;
      l.onCount(2);
      return unsubscribe;
    });
  });

  it("sends the count, and again when it changes", async () => {
    const { response, read, abort } = await open();

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(await read()).toBe(sseFrame("count", 2));

    listener.onCount(3);
    expect(await read()).toBe(sseFrame("count", 3));

    abort.abort();
  });

  it("unsubscribes when the client disconnects", async () => {
    const { read, abort } = await open();
    await read();

    abort.abort();

    expect(await read()).toBeNull();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("ends the stream when the count can't be read", async () => {
    const { read } = await open();
    await read();

    listener.onError();

    expect(await read()).toBeNull();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("ends the stream when it can't subscribe", async () => {
    jest.spyOn(console, "error").mockImplementation();
    (subscribeToCount as jest.Mock).mockRejectedValue(
      new Error("connection refused"),
    );

    const { read } = await open();

    expect(await read()).toBeNull();
  });
});
