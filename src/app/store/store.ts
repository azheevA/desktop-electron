import { configureStore } from "@reduxjs/toolkit";
import { tasksReducer } from "@/entities/task";
import { projectsReducer } from "@/entities/project";
import { profileReducer } from "@/entities/profile";
import { notificationsReducer } from "@/entities/notification";
import { notificationListenerMiddleware } from "./notification-listeners";

export const makeStore = () => configureStore({
  reducer: {
    tasks: tasksReducer,
    projects: projectsReducer,
    profile: profileReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(notificationListenerMiddleware.middleware),
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
