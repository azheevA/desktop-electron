import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { NotificationDraft, NotificationItem, NotificationSnapshot } from "./notification-types";

export type NotificationsState = {
  items: NotificationItem[];
  dismissedKeys: string[];
  hydrated: boolean;
};

const initialState: NotificationsState = {
  items: [],
  dismissedKeys: [],
  hydrated: false,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    hydrateNotifications(state, action: PayloadAction<NotificationSnapshot>) {
      state.items = action.payload.items.slice(0, 500);
      state.dismissedKeys = action.payload.dismissedKeys.slice(0, 1000);
      state.hydrated = true;
    },
    addNotification(state, action: PayloadAction<NotificationItem>) {
      if (state.dismissedKeys.includes(action.payload.dedupeKey)) return;
      if (state.items.some((item) => item.dedupeKey === action.payload.dedupeKey)) return;
      state.items.unshift(action.payload);
      if (state.items.length > 500) state.items.length = 500;
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notification = state.items.find((item) => item.id === action.payload);
      if (notification && !notification.readAt) notification.readAt = new Date().toISOString();
    },
    markAllNotificationsRead(state) {
      const readAt = new Date().toISOString();
      state.items.forEach((notification) => {
        if (!notification.readAt) notification.readAt = readAt;
      });
    },
    deleteNotification(state, action: PayloadAction<string>) {
      const notification = state.items.find((item) => item.id === action.payload);
      if (notification && !state.dismissedKeys.includes(notification.dedupeKey)) {
        state.dismissedKeys.unshift(notification.dedupeKey);
      }
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.dismissedKeys.length > 1000) state.dismissedKeys.length = 1000;
    },
    clearReadNotifications(state) {
      const readItems = state.items.filter((item) => item.readAt);
      readItems.forEach((item) => {
        if (!state.dismissedKeys.includes(item.dedupeKey)) state.dismissedKeys.unshift(item.dedupeKey);
      });
      state.items = state.items.filter((item) => !item.readAt);
      if (state.dismissedKeys.length > 1000) state.dismissedKeys.length = 1000;
    },
    clearAllNotifications(state) {
      state.items.forEach((item) => {
        if (!state.dismissedKeys.includes(item.dedupeKey)) state.dismissedKeys.unshift(item.dedupeKey);
      });
      state.items = [];
      if (state.dismissedKeys.length > 1000) state.dismissedKeys.length = 1000;
    },
  },
});

export function createNotification(draft: NotificationDraft): NotificationItem {
  return {
    ...draft,
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    readAt: null,
  };
}

export const {
  hydrateNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearReadNotifications,
  clearAllNotifications,
} = notificationsSlice.actions;

export { initialState as notificationsInitialState };
export default notificationsSlice.reducer;
