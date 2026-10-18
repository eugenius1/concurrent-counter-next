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

  it.each([
    ["a change", "onChange", () => notify(JSON.stringify(change))],
    ["a reconnect", "onReset", () => reconnected()],
  ] as const)(
    "tells every subscriber of %s, even after one throws",
    async (_, callback, trigger) => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const failing = { onChange: jest.fn(), onReset: jest.fn() };
      failing[callback].mockImplementation(() => {
        throw new Error("stream closed");
      });
      const working = { onChange: jest.fn(), onReset: jest.fn() };
      const unsubscribes = [
        await subscribeToCounters(failing),
        await subscribeToCounters(working),
      ];

      expect(trigger).not.toThrow();

      expect(failing[callback]).toHaveBeenCalled();
      expect(working[callback]).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      consoleSpy.mockRestore();
    },
  );
});
