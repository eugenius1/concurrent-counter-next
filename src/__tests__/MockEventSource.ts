import { act } from "react";

type Listener = (event: { data: string }) => void;

// jsdom has no EventSource, so stand in a controllable one
export class MockEventSource {
  static instances: MockEventSource[] = [];

  /** Replaces the global EventSource; call before each test. */
  static install() {
    MockEventSource.instances = [];
    global.EventSource = MockEventSource as unknown as typeof EventSource;
  }

  listeners: Record<string, Listener[]> = {};
  close = jest.fn();

  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: Listener) {
    (this.listeners[type] ??= []).push(listener);
  }

  emit(type: string, data: unknown) {
    act(() => {
      this.listeners[type]?.forEach((listener) =>
        listener({ data: JSON.stringify(data) }),
      );
    });
  }
}
