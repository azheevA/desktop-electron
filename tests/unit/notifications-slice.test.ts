import { describe, expect, test } from "bun:test";
import reducer, {
  addNotification,
  clearAllNotifications,
  clearReadNotifications,
  deleteNotification,
  hydrateNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../src/entities/notification/model/notifications-slice";
import type { NotificationItem } from "../../src/entities/notification/model/notification-types";

const notification: NotificationItem = {
  id: "notification-1",
  type: "task-created",
  title: "Новая задача",
  message: "Создана задача",
  entityType: "task",
  entityId: "task-1",
  dedupeKey: "task-created:task-1",
  createdAt: "2026-11-24T10:00:00.000Z",
  readAt: null,
};

describe("notifications reducer", () => {
  test("hydrates notification items and dismissed keys", () => {
    const state = reducer(
      undefined,
      hydrateNotifications({ items: [notification], dismissedKeys: ["dismissed:1"] }),
    );

    expect(state.items).toEqual([notification]);
    expect(state.dismissedKeys).toEqual(["dismissed:1"]);
    expect(state.hydrated).toBe(true);
  });

  test("deduplicates by dedupeKey", () => {
    const state = reducer(
      { items: [notification], dismissedKeys: [], hydrated: true },
      addNotification({ ...notification, id: "notification-2" }),
    );

    expect(state.items).toHaveLength(1);
  });

  test("does not re-add dismissed notifications", () => {
    const state = reducer(
      { items: [], dismissedKeys: [notification.dedupeKey], hydrated: true },
      addNotification(notification),
    );

    expect(state.items).toHaveLength(0);
  });

  test("marks one and all notifications as read", () => {
    const initial = {
      items: [notification, { ...notification, id: "notification-2", dedupeKey: "second" }],
      dismissedKeys: [],
      hydrated: true,
    };
    const oneRead = reducer(initial, markNotificationRead(notification.id));
    const allRead = reducer(oneRead, markAllNotificationsRead());

    expect(typeof oneRead.items[0]?.readAt).toBe("string");
    expect(allRead.items.every((item) => Boolean(item.readAt))).toBe(true);
  });

  test("deleting a notification dismisses its dedupe key", () => {
    const state = reducer(
      { items: [notification], dismissedKeys: [], hydrated: true },
      deleteNotification(notification.id),
    );

    expect(state.items).toHaveLength(0);
    expect(state.dismissedKeys).toContain(notification.dedupeKey);
  });

  test("clears only read notifications and remembers their keys", () => {
    const read = { ...notification, readAt: "2026-11-24T11:00:00.000Z" };
    const unread = { ...notification, id: "unread", dedupeKey: "unread", readAt: null };
    const state = reducer(
      { items: [read, unread], dismissedKeys: [], hydrated: true },
      clearReadNotifications(),
    );

    expect(state.items).toEqual([unread]);
    expect(state.dismissedKeys).toContain(read.dedupeKey);
  });

  test("clearing all notifications dismisses their dedupe keys", () => {
    const state = reducer(
      { items: [notification], dismissedKeys: [], hydrated: true },
      clearAllNotifications(),
    );

    expect(state.items).toHaveLength(0);
    expect(state.dismissedKeys).toContain(notification.dedupeKey);
  });
});
