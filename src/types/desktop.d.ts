import type { Project } from "@/entities/project";
import type { Task } from "@/entities/task";
import type { UserProfile } from "@/entities/profile";
import type { NotificationItem } from "@/entities/notification";

export {};

declare global {
  interface DesktopWorkspaceData {
    version: 2;
    profile: UserProfile;
    projects: Project[];
    tasks: Task[];
    notifications: NotificationItem[];
    dismissedNotificationKeys: string[];
    updatedAt?: string;
  }

  interface Window {
    desktopApp?: {
      isDesktop: boolean;
      platform: string;
      minimize: () => void;
      toggleMaximize: () => void;
      close: () => void;
      getWindowState: () => Promise<{ isMaximized: boolean }>;
      onMaximizeChange: (
        callback: (isMaximized: boolean) => void,
      ) => () => void;
      loadWorkspace: () => Promise<DesktopWorkspaceData | null>;
      saveWorkspace: (
        data: DesktopWorkspaceData,
      ) => Promise<{ savedAt: string }>;
    };
  }
}
