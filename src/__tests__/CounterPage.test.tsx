import { render, screen, fireEvent } from "@testing-library/react";
import CounterPage from "../components/CounterPage";
import { MockEventSource } from "./MockEventSource";

const id = "01HQ8XVNZ8YRTKP6QXDJ8W12N3";

describe("CounterPage Component", () => {
  let writeText: jest.Mock;

  const renderPage = () => {
    const view = render(<CounterPage id={id} initialValue="7" />);
    return { ...view, events: MockEventSource.instances[0] };
  };

  const setNavigator = (property: string, value: unknown) =>
    Object.defineProperty(navigator, property, { value, configurable: true });

  beforeEach(() => {
    MockEventSource.install();
    writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator("clipboard", { writeText });
    setNavigator("share", undefined);
  });

  it("shows the counter with the value it was rendered with", () => {
    renderPage();

    expect(screen.getByTestId(`counter-${id}`)).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("opens the counter's stream and closes it on unmount", () => {
    const { events, unmount } = renderPage();

    expect(events.url).toBe(`/api/counters/${id}/stream`);

    unmount();
    expect(events.close).toHaveBeenCalled();
  });

  it("updates the value when it changes", () => {
    const { events } = renderPage();

    events.emit("change", { id, value: "43" });

    expect(screen.getByText("43")).toBeInTheDocument();
  });

  it("copies the page's link", async () => {
    renderPage();

    fireEvent.click(screen.getByText("Copy link"));

    expect(await screen.findByText("Link copied")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });

  it("says so when the link can't be copied", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    writeText.mockRejectedValue(new Error("denied"));

    renderPage();
    fireEvent.click(screen.getByText("Copy link"));

    expect(await screen.findByText(/Couldn't copy the link/)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("puts Share before Copy link", () => {
    renderPage();

    const labels = screen
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(labels.indexOf("Share")).toBeLessThan(labels.indexOf("Copy link"));
  });

  it("copies the link from Share where there is no share sheet", async () => {
    renderPage();

    fireEvent.click(screen.getByText("Share"));

    expect(await screen.findByText("Link copied")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });

  it("shares the page's link through the share sheet", () => {
    const share = jest.fn().mockResolvedValue(undefined);
    setNavigator("share", share);

    renderPage();
    fireEvent.click(screen.getByText("Share"));

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ url: window.location.href }),
    );
    expect(writeText).not.toHaveBeenCalled();
  });
});
