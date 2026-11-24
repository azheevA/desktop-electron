import type { NotificationsState } from "./notifications-slice";

type NotificationsRootState = { notifications: NotificationsState };

export const selectNotifications = (state: NotificationsRootState) => state.notifications.items;
export const selectNotificationsHydrated = (state: NotificationsRootState) => state.notifications.hydrated;
export const selectUnreadNotificationsCount = (state: NotificationsRootState) =>
  state.notifications.items.reduce((count, notification) => count + (notification.readAt ? 0 : 1), 0);

export const selectDismissedNotificationKeys = (state: NotificationsRootState) => state.notifications.dismissedKeys;
