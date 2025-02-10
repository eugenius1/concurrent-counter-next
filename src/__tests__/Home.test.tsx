import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import Home from "../app/page";
import { supabase } from "../lib/supabase";
import { ulid } from "ulid";

// Mock ulid
jest.mock("ulid");

// Mock supabase
jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(),
  },
}));

describe("Home Component", () => {
  const mockCounters = [
    "01HQ8XVNZ8YRTKP6QXDJ8W12N3",
    "01HQ8XVNZ8YRTKP6QXDJ8W12N4",
  ];

  let mockChannel: {
    on: jest.Mock;
    subscribe: jest.Mock;
    unsubscribe: jest.Mock;
  };
  let mockFrom: {
    select: jest.Mock;
    order: jest.Mock;
    eq: jest.Mock;
    single: jest.Mock;
    insert?: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock channel
    mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn(),
    };
    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

    // Setup default from mock
    const mockData = mockCounters.map((id) => ({ id }));
    mockFrom = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: mockData[0].id, value: 0 },
        error: null,
      }),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockFrom);
  });

  it("renders the title", async () => {
    await act(async () => {
      render(<Home />);
    });
    expect(screen.getByText("Concurrent Counter")).toBeInTheDocument();
  });

  it("fetches and displays counters on load", async () => {
    await act(async () => {
      render(<Home />);
    });

    mockCounters.forEach((id) => {
      expect(screen.getByTestId(`counter-${id}`)).toBeInTheDocument();
    });
  });

  it("creates a new counter when button is clicked", async () => {
    const newId = "01HQ8XVNZ8YRTKP6QXDJ8W12N5";
    (ulid as jest.Mock).mockReturnValue(newId);

    // Mock the Supabase responses
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ id: newId, value: 0 }],
        error: null,
      }),
    });

    mockFrom.insert = mockInsert;
    (supabase.from as jest.Mock).mockReturnValue(mockFrom);

    await act(async () => {
      render(<Home />);
    });

    // Click the create button
    await act(async () => {
      fireEvent.click(screen.getByText("Create New Counter"));
    });

    // Verify that insert was called with correct parameters
    expect(mockInsert).toHaveBeenCalledWith([{ id: newId, value: 0 }]);
  });

  it("shows error in console when counter creation fails", async () => {
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    // Mock the Supabase responses
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: new Error("Failed to create counter"),
      }),
    });

    mockFrom.insert = mockInsert;
    (supabase.from as jest.Mock).mockReturnValue(mockFrom);

    await act(async () => {
      render(<Home />);
    });

    // Click the create button
    await act(async () => {
      fireEvent.click(screen.getByText("Create New Counter"));
    });

    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error creating counter:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("subscribes to counter updates", async () => {
    await act(async () => {
      render(<Home />);
    });

    // Verify that channel subscription was created
    expect(supabase.channel).toHaveBeenCalledWith("counters");
    expect(mockChannel.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "counters",
      },
      expect.any(Function)
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });
});
