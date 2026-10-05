import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../app/page";
import { MockEventSource } from "./MockEventSource";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("Home Component", () => {
  const newCounter = { id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3", value: 0 };

  let mockFetch: jest.Mock;

  const renderHome = () => {
    const view = render(<Home />);
    return { ...view, events: MockEventSource.instances[0] };
  };

  beforeEach(() => {
    push.mockClear();
    MockEventSource.install();
    mockFetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => newCounter });
    global.fetch = mockFetch;
  });

  it("renders the title", () => {
    renderHome();
    expect(screen.getByText("Concurrent Counter")).toBeInTheDocument();
  });

  it("opens the count stream and closes it on unmount", () => {
    const { events, unmount } = renderHome();

    expect(events.url).toBe("/api/counters/stream");

    unmount();
    expect(events.close).toHaveBeenCalled();
  });

  it("shows how many counters exist and keeps the number current", () => {
    const { events } = renderHome();
    expect(screen.queryByTestId("counter-count")).not.toBeInTheDocument();

    events.emit("count", 1);
    expect(screen.getByText("1 counter created so far")).toBeInTheDocument();

    events.emit("count", 1234);
    expect(
      screen.getByText("1,234 counters created so far"),
    ).toBeInTheDocument();
  });

  it("lists no counters", () => {
    const { events } = renderHome();

    events.emit("count", 2);

    expect(screen.queryByTestId(/^counter-0/)).not.toBeInTheDocument();
  });

  it("creates a counter and goes to its page", async () => {
    renderHome();

    fireEvent.click(screen.getByText("Create New Counter"));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(`/c/${newCounter.id}`);
    });
    expect(mockFetch).toHaveBeenCalledWith("/api/counters", {
      method: "POST",
    });
  });

  it("stays on the homepage when counter creation fails", async () => {
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
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByText("Create New Counter")).toBeEnabled();

    consoleSpy.mockRestore();
  });
});
