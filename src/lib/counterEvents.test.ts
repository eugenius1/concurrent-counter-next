/** @jest-environment node */
import { subscribeToCounters } from "./counterEvents";
import { db } from "./db";

jest.mock("./db", () => ({ db: jest.fn() }));

const change = { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3", value: "1", created: false };

describe("subscribeToCounters", () => {
  let notify: (payload: string) => void;
  let reconnected: () => void;

  beforeEach(() => {
    (db as jest.Mock).mockResolvedValue({
      listen: jest.fn(async (_channel, onNotify, onListen) => {
        notify = onNotify;
        reconnected = onListen;
        onListen();
      }),
    });
  });

  it("hands a change to every subscriber, even after one throws", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const failing = {
      onChange: jest.fn(() => {
        throw new Error("stream closed");
      }),
      onReset: jest.fn(),
    };
    const working = { onChange: jest.fn(), onReset: jest.fn() };
    const unsubscribeFailing = await subscribeToCounters(failing);
    const unsubscribeWorking = await subscribeToCounters(working);

    expect(() => notify(JSON.stringify(change))).not.toThrow();

    expect(failing.onChange).toHaveBeenCalledWith(change);
    expect(working.onChange).toHaveBeenCalledWith(change);
    expect(consoleSpy).toHaveBeenCalled();
    unsubscribeFailing();
    unsubscribeWorking();
    consoleSpy.mockRestore();
  });

  it("tells every subscriber of a reconnect, even after one throws", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const failing = {
      onChange: jest.fn(),
      onReset: jest.fn(() => {
        throw new Error("stream closed");
      }),
    };
    const working = { onChange: jest.fn(), onReset: jest.fn() };
    const unsubscribeFailing = await subscribeToCounters(failing);
    const unsubscribeWorking = await subscribeToCounters(working);

    expect(() => reconnected()).not.toThrow();

    expect(failing.onReset).toHaveBeenCalled();
    expect(working.onReset).toHaveBeenCalled();
    unsubscribeFailing();
    unsubscribeWorking();
    consoleSpy.mockRestore();
  });
});
