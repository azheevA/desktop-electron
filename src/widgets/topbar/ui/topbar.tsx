"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCheck,
  ChevronDown,
  CircleCheck,
  ClipboardList,
  FolderKanban,
  FolderPlus,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  clearReadNotifications,
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
  selectNotifications,
  selectUnreadNotificationsCount,
  type NotificationItem,
  type NotificationType,
} from "@/entities/notification";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import { Input } from "@/shared/ui";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  title: string;
  onOpenNotification: (notification: NotificationItem) => void;
};

const notificationIcons: Record<NotificationType, LucideIcon> = {
  "task-created": ClipboardList,
  "task-completed": CircleCheck,
  "task-status": Pencil,
  "task-deleted": Trash2,
  "project-created": FolderPlus,
  "project-updated": FolderKanban,
  "project-deleted": FolderKanban,
  "deadline-today": CalendarClock,
  "deadline-overdue": AlertTriangle,
};

const notificationTone: Record<NotificationType, string> = {
  "task-created": "bg-[#66d9e814] text-cyan",
  "task-completed": "bg-[#a5f36b18] text-accent",
  "task-status": "bg-[#66d9e814] text-cyan",
  "task-deleted": "bg-[#f08b7618] text-[#f08b76]",
  "project-created": "bg-[#ad91f518] text-[#c4a6ff]",
  "project-updated": "bg-[#ad91f518] text-[#c4a6ff]",
  "project-deleted": "bg-[#f08b7618] text-[#f08b76]",
  "deadline-today": "bg-[#e8c36f18] text-[#e8c36f]",
  "deadline-overdue": "bg-[#f08b7618] text-[#f08b76]",
};

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Недавно";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay)
    return `Сегодня, ${new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(date)}`;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function NotificationCenter({
  onOpenNotification,
}: {
  onOpenNotification: Props["onOpenNotification"];
}) {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    [notifications],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const openNotification = (notification: NotificationItem) => {
    dispatch(markNotificationRead(notification.id));
    setIsOpen(false);
    onOpenNotification(notification);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={
          unreadCount
            ? `Уведомления, непрочитанных: ${unreadCount}`
            : "Уведомления"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`relative grid size-9 place-items-center rounded-lg transition hover:bg-[#18222d] ${isOpen ? "bg-[#18222d] text-accent" : "text-[#8492a4]"}`}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-[#080b12] bg-accent px-1 text-[8px] font-extrabold leading-none text-[#10170e] shadow-[0_0_10px_#a5f36b55]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-label="Центр уведомлений"
          className="absolute right-0 top-[calc(100%+12px)] z-[120] flex max-h-[min(620px,calc(100dvh-110px))] w-[min(390px,calc(100vw-28px))] flex-col overflow-hidden rounded-xl border border-[#2a3948] bg-[#101720] shadow-[0_22px_70px_#000b]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-bold text-[#edf2f7]">
                  Уведомления
                </h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#a5f36b18] px-2 py-0.5 font-mono text-[9px] text-accent">
                    {unreadCount} новых
                  </span>
                )}
              </div>
              <p className="mt-1 text-[9px] text-[#718094]">
                События и напоминания вашего пространства
              </p>
            </div>
            <button
              type="button"
              disabled={unreadCount === 0}
              onClick={() => dispatch(markAllNotificationsRead())}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[9px] text-[#a5f36b] transition hover:bg-[#a5f36b12] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <CheckCheck size={13} /> Прочитать все
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {sortedNotifications.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-7 text-center">
                <span className="grid size-11 place-items-center rounded-xl bg-[#a5f36b12] text-accent">
                  <Bell size={20} />
                </span>
                <strong className="mt-3 text-[11px] font-semibold text-[#dce5ec]">
                  Пока всё спокойно
                </strong>
                <p className="mt-1.5 max-w-[240px] text-[10px] leading-5 text-[#718094]">
                  Здесь появятся уведомления о задачах, проектах и
                  приближающихся сроках.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#202b39]">
                {sortedNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  return (
                    <div
                      key={notification.id}
                      className={`group flex gap-3 px-4 py-3 transition hover:bg-[#151f2a] ${notification.readAt ? "opacity-70" : "bg-[#a5f36b05]"}`}
                    >
                      <span
                        className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${notificationTone[notification.type]}`}
                      >
                        <Icon size={15} />
                      </span>
                      <button
                        type="button"
                        onClick={() => openNotification(notification)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="flex items-start gap-2">
                          <strong className="min-w-0 flex-1 text-[10px] font-bold leading-4 text-[#e5edf3]">
                            {notification.title}
                          </strong>
                          {!notification.readAt && (
                            <i className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_7px_#a5f36b]" />
                          )}
                        </span>
                        <span className="mt-1 block text-[9px] leading-[1.55] text-[#8a98a9]">
                          {notification.message}
                        </span>
                        <span className="mt-1.5 block font-mono text-[8px] text-[#5f6e81]">
                          {formatNotificationDate(notification.createdAt)}
                        </span>
                      </button>
                      <button
                        type="button"
                        title="Удалить уведомление"
                        aria-label="Удалить уведомление"
                        onClick={() =>
                          dispatch(deleteNotification(notification.id))
                        }
                        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-[#586779] opacity-0 transition hover:bg-[#f08b7615] hover:text-[#f08b76] group-hover:opacity-100 focus:opacity-100 max-[620px]:opacity-100"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <footer className="flex items-center justify-between border-t border-line bg-[#0d141d] px-4 py-2.5">
              <span className="text-[8px] text-[#657487]">
                Всего: {notifications.length}
              </span>
              <button
                type="button"
                disabled={!notifications.some((item) => item.readAt)}
                onClick={() => dispatch(clearReadNotifications())}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[9px] text-[#8795a6] transition hover:bg-[#1a2632] hover:text-[#dce5ec] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Trash2 size={12} /> Удалить прочитанные
              </button>
            </footer>
          )}
        </section>
      )}
    </div>
  );
}

export function Topbar({ search, onSearch, title, onOpenNotification }: Props) {
  return (
    <header className="relative z-20 flex h-[clamp(68px,7vh,86px)] shrink-0 items-center justify-between border-b border-line px-[clamp(22px,3vw,64px)] max-[1150px]:px-7 max-[620px]:h-[62px] max-[620px]:px-4">
      <div className="flex items-center gap-[11px] text-[11px] text-[#718094] max-[620px]:text-[10px]">
        <span>Рабочее пространство</span>
        <span className="text-[#3d4b5c]">/</span>
        <strong className="font-semibold text-[#eaf0f4]">{title}</strong>
      </div>
      <div className="flex items-center gap-[17px] max-[620px]:gap-2.5">
        <label className="relative flex h-[35px] w-[clamp(220px,18vw,360px)] items-center gap-2 rounded-lg border border-[#263342] bg-[#0e141d] px-[9px] text-[#728195] max-[620px]:w-[34px] max-[620px]:px-[9px]">
          <Search size={15} className="shrink-0" />
          <Input
            id="global-search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Поиск по проектам и задачам..."
            aria-label="Поиск по проектам и задачам"
            className="h-full border-0 bg-transparent px-0 text-[10px] focus:ring-0 max-[620px]:hidden"
          />
          <kbd className="whitespace-nowrap rounded border border-[#344252] px-[5px] py-[3px] font-mono text-[9px] text-[#8c9bad] max-[620px]:hidden">
            Ctrl K
          </kbd>
        </label>
        <NotificationCenter onOpenNotification={onOpenNotification} />
        <div className="h-[23px] w-px bg-[#263342] max-[620px]:hidden" />
        <button
          type="button"
          className="flex items-center gap-2.5 border-0 bg-transparent text-[10px] text-[#a8b4c2] max-[620px]:hidden"
        >
          {new Intl.DateTimeFormat("ru-RU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date())}
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}
