import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import Counter from "../components/Counter";
import { supabase } from "../lib/supabase";

// Mock supabase
jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(),
    rpc: jest.fn(),
  },
}));

// Mock data
const mockCounter = {
  id: "01HQ8XVNZ8YRTKP6QXDJ8W12N3",
  value: 42,
};

describe("Counter Component", () => {
  let mockChannel: {
    on: jest.Mock;
    subscribe: jest.Mock;
    unsubscribe: jest.Mock;
  };
  let mockSubscription: {
    unsubscribe: jest.Mock;
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up subscription and channel mocks
    mockSubscription = {
      unsubscribe: jest.fn(),
    };

    mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue(mockSubscription),
      unsubscribe: jest.fn(),
    };

    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

    // Setup default from mock
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockCounter, error: null }),
    });
  });

  it("renders loading state initially", () => {
    render(<Counter id={mockCounter.id} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders counter value after loading", async () => {
    await act(async () => {
      render(<Counter id={mockCounter.id} />);
    });

    // Wait for the counter value to appear
    await waitFor(() => {
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });

  it("shows error in console when fetching fails", async () => {
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    // Mock the Supabase error response
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: new Error("Failed to fetch"),
      }),
    });

    await act(async () => {
      render(<Counter id={mockCounter.id} />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching counter:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("calls update_counter RPC when increment button is clicked", async () => {
    // Mock the RPC call
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: null });

    await act(async () => {
      render(<Counter id={mockCounter.id} />);
    });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    // Click the increment button
    await act(async () => {
      fireEvent.click(screen.getByText("Increase"));
    });

    // Verify RPC was called with correct parameters
    expect(supabase.rpc).toHaveBeenCalledWith("update_counter", {
      counter_id: mockCounter.id,
      increment_by: 1,
    });
  });

  it("calls update_counter RPC when decrement button is clicked", async () => {
    // Mock the RPC call
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: null });

    await act(async () => {
      render(<Counter id={mockCounter.id} />);
    });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    // Click the decrement button
    await act(async () => {
      fireEvent.click(screen.getByText("Decrease"));
    });

    // Verify RPC was called with correct parameters
    expect(supabase.rpc).toHaveBeenCalledWith("update_counter", {
      counter_id: mockCounter.id,
      increment_by: -1,
    });
  });

  it("shows error in console when update fails", async () => {
    // Mock the RPC error
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error("Update failed"),
    });

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await act(async () => {
      render(<Counter id={mockCounter.id} />);
    });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    // Click the increment button
    await act(async () => {
      fireEvent.click(screen.getByText("Increase"));
    });

    // Verify error was logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error updating counter:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("unsubscribes from channel on unmount", async () => {
    const { unmount } = render(<Counter id={mockCounter.id} />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    // Unmount the component
    unmount();

    // Verify unsubscribe was called
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });
});
