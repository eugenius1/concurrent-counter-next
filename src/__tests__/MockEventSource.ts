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

  /** The stream opened for a URL; a page may hold more than one. */
  static for(url: string) {
    return MockEventSource.instances.find((events) => events.url === url)!;
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
