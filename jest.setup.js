import '@testing-library/jest-dom'

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => {
  const mockSubscription = {
    unsubscribe: jest.fn(),
  };

  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue(mockSubscription),
  };

  const createMockQuery = (returnValue = {}) => {
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(returnValue),
      order: jest.fn().mockResolvedValue(returnValue),
      insert: jest.fn().mockImplementation((data) => ({
        select: jest.fn().mockResolvedValue({ data, error: null }),
      })),
    };
    return jest.fn(() => query);
  };

  return {
    createClient: jest.fn(() => ({
      from: createMockQuery(),
      rpc: jest.fn(),
      channel: jest.fn().mockReturnValue(mockChannel),
    })),
  };
}) 