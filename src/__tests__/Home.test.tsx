import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import Home from "../app/page";

// jsdom has no EventSource, so stand in a controllable one
class MockEventSource {
  static instances: MockEventSource[] = [];

  listeners: Record<string, ((event: { data: string }) => void)[]> = {};
  close = jest.fn();

  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: { data: string }) => void) {
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

describe("Home Component", () => {
  const mockCounters = [
    { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3", value: 1 },
    { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N4", value: 2 },
  ];

  let mockFetch: jest.Mock;

  const renderHome = () => {
    const view = render(<Home />);
    return { ...view, events: MockEventSource.instances[0] };
  };

  beforeEach(() => {
    MockEventSource.instances = [];
    global.EventSource = MockEventSource as unknown as typeof EventSource;
    mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;
  });

  it("renders the title", () => {
    renderHome();
    expect(screen.getByText("Concurrent Counter")).toBeInTheDocument();
  });

  it("opens the counter stream and closes it on unmount", () => {
    const { events, unmount } = renderHome();

    expect(events.url).toBe("/api/counters/stream");

    unmount();
    expect(events.close).toHaveBeenCalled();
  });

  it("displays the counters from a snapshot", () => {
    const { events } = renderHome();

    events.emit("snapshot", mockCounters);

    mockCounters.forEach(({ id }) => {
      expect(screen.getByTestId(`counter-${id}`)).toBeInTheDocument();
    });
  });

  it("updates a counter when it changes", () => {
    const { events } = renderHome();
    events.emit("snapshot", mockCounters);

    events.emit("change", { id: mockCounters[0].id, value: 43 });

    expect(screen.getByText("43")).toBeInTheDocument();
    expect(screen.getAllByTestId(/^counter-/)).toHaveLength(2);
  });

  it("adds a counter created elsewhere", () => {
    const { events } = renderHome();
    events.emit("snapshot", mockCounters);

    const newId = "01HQ8XVNZ8YRTKP6QXDJ8W12N5";
    events.emit("change", { id: newId, value: 0 });

    expect(screen.getByTestId(`counter-${newId}`)).toBeInTheDocument();
    expect(screen.getAllByTestId(/^counter-/)).toHaveLength(3);
  });

  it("creates a new counter when button is clicked", async () => {
    renderHome();

    fireEvent.click(screen.getByText("Create New Counter"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/counters", {
        method: "POST",
      });
    });
  });

  it("shows error in console when counter creation fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    renderHome();
    fireEvent.click(screen.getByText("Create New Counter"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error creating counter:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });
});
