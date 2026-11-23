import { create } from 'zustand';
import { getUnreadCount } from '../api/market';

// How many conversations have a message the signed-in person hasn't read,
// for the Messages badge in the header. Refreshed on navigation, when the
// tab regains focus, and after a thread is read.
export const useUnreadStore = create((set) => ({
  count: 0,
  refresh: async () => {
    try {
      set({ count: await getUnreadCount() });
    } catch {
      // Keep the last count; the badge isn't worth an error message.
    }
  },
  clear: () => set({ count: 0 }),
}));
