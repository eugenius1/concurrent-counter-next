import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Counter from "../components/Counter";

const mockCounter = {
  id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3",
  value: "42",
};

describe("Counter Component", () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;
  });

  it("renders the counter value and short id", () => {
    render(<Counter {...mockCounter} />);

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(
      screen.getByText(`Counter #${mockCounter.id.slice(-6)}`),
    ).toBeInTheDocument();
  });

  it.each([
    ["Increase", 1],
    ["Decrease", -1],
  ])("posts an increment when %s is clicked", async (label, by) => {
    render(<Counter {...mockCounter} />);

    fireEvent.click(screen.getByText(label));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/counters/${mockCounter.id}/increment`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ by }),
        }),
      );
    });
  });

  it.each([
    [429, "That's too many presses. Try again in a moment."],
    [500, "Couldn't update the counter. Try again later."],
  ])("tells the user when the update fails with %d", async (status, message) => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockFetch.mockResolvedValue({ ok: false, status });

    render(<Counter {...mockCounter} />);
    fireEvent.click(screen.getByText("Increase"));

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    consoleSpy.mockRestore();
  });

  it("logs an error when the update fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    render(<Counter {...mockCounter} />);
    fireEvent.click(screen.getByText("Increase"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error updating counter:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });
});
