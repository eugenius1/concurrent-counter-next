/** @jest-environment node */
import { RECOUNT_MS, subscribeToCount } from "./counterCount";
import { subscribeToCounters, type CounterSubscriber } from "./counterEvents";
import { db } from "./db";

jest.mock("./db", () => ({ db: jest.fn() }));
jest.mock("./counterEvents", () => ({ subscribeToCounters: jest.fn() }));

const created = { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3", value: "0", created: true };

describe("subscribeToCount", () => {
  let source: CounterSubscriber;
  let sql: jest.Mock;

  const listen = async () => {
    const listener = { onCount: jest.fn(), onError: jest.fn() };
    const unsubscribe = await subscribeToCount(listener);
    return { ...listener, unsubscribe };
  };
  // Lets a count that was asked for be read and sent
  const settle = () => jest.advanceTimersByTimeAsync(0);

  beforeEach(() => {
    jest.useFakeTimers();
    // The count outlives a test otherwise: it is shared by the whole process
    delete (globalThis as { counterCount?: unknown }).counterCount;
    (subscribeToCounters as jest.Mock)
      .mockReset()
      .mockImplementation(async (subscriber) => {
        source = subscriber;
        return jest.fn();
      });
    sql = jest.fn().mockResolvedValue([{ count: 2 }]);
    (db as jest.Mock).mockResolvedValue(sql);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sends the count, and again when a counter is created", async () => {
    const first = await listen();
    await settle();
    expect(first.onCount.mock.calls).toEqual([[2]]);

    await jest.advanceTimersByTimeAsync(RECOUNT_MS);
    sql.mockResolvedValue([{ count: 3 }]);
    source.onChange(created);
    await settle();

    expect(first.onCount.mock.calls).toEqual([[2], [3]]);
  });

  it("ignores a counter that only changes value", async () => {
    const first = await listen();
    await jest.advanceTimersByTimeAsync(RECOUNT_MS);

    source.onChange({ ...created, created: false });
    await settle();

    expect(first.onCount).toHaveBeenCalledTimes(1);
    expect(sql).toHaveBeenCalledTimes(1);
  });

  it("reads one count for every listener", async () => {
    const listeners = await Promise.all([listen(), listen(), listen()]);
    await settle();
    const late = await listen();

    [...listeners, late].forEach(({ onCount }) =>
      expect(onCount.mock.calls).toEqual([[2]]),
    );
    expect(sql).toHaveBeenCalledTimes(1);
    expect(subscribeToCounters).toHaveBeenCalledTimes(1);
  });

  it("counts a burst of creates once, after the wait", async () => {
    const first = await listen();
    await settle();

    sql.mockResolvedValue([{ count: 50 }]);
    for (let i = 0; i < 48; i++) source.onChange(created);
    await settle();
    expect(sql).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(RECOUNT_MS);

    expect(sql).toHaveBeenCalledTimes(2);
    expect(first.onCount.mock.calls).toEqual([[2], [50]]);
  });

  it("sends nothing when a recount finds the same number", async () => {
    const first = await listen();
    await jest.advanceTimersByTimeAsync(RECOUNT_MS);

    source.onChange(created);
    await settle();

    expect(sql).toHaveBeenCalledTimes(2);
    expect(first.onCount.mock.calls).toEqual([[2]]);
  });

  it("recounts when the database listener reconnects", async () => {
    const first = await listen();
    await jest.advanceTimersByTimeAsync(RECOUNT_MS);

    sql.mockResolvedValue([{ count: 4 }]);
    source.onReset();
    await settle();

    expect(first.onCount.mock.calls).toEqual([[2], [4]]);
  });

  it("stops telling a listener that unsubscribed", async () => {
    const first = await listen();
    await jest.advanceTimersByTimeAsync(RECOUNT_MS);

    first.unsubscribe();
    source.onChange(created);
    await settle();

    expect(first.onCount).toHaveBeenCalledTimes(1);
  });

  it("drops its listeners when the count can't be read, then recovers", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    sql.mockRejectedValue(new Error("connection refused"));

    const first = await listen();
    await settle();
    expect(first.onError).toHaveBeenCalled();
    expect(first.onCount).not.toHaveBeenCalled();

    sql.mockResolvedValue([{ count: 2 }]);
    const second = await listen();
    await jest.advanceTimersByTimeAsync(RECOUNT_MS);

    expect(second.onCount.mock.calls).toEqual([[2]]);
    expect(first.onCount).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("subscribes again after failing to", async () => {
    (subscribeToCounters as jest.Mock).mockRejectedValueOnce(
      new Error("connection refused"),
    );

    await expect(listen()).rejects.toThrow("connection refused");
    const second = await listen();
    await settle();

    expect(second.onCount.mock.calls).toEqual([[2]]);
  });
});
