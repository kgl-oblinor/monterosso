// Mock implementation of dashboard data (threads list). Swapped out for the real API
// the same way authApi is — see features/dashboard/api/threads.ts.
import { delay, mockThreads, type MockThread } from "./fixtures";

export const mockDashboardApi = {
  async listThreads(): Promise<MockThread[]> {
    await delay(400);
    return mockThreads;
  },
};
