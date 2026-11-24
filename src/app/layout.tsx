import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StoreProvider } from "@/app/providers/store-provider";
import { DesktopTitlebar } from "@/widgets/desktop-titlebar";
import { siteUrl } from "@/shared/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "my desktop — проекты и задачи в одном пространстве",
    template: "%s | my desktop",
  },
  description:
    "my desktop — персональное рабочее пространство для управления проектами и задачами. Планируйте работу, ведите Kanban-доску, отслеживайте прогресс и получайте напоминания.",
  applicationName: "my desktop",
  category: "productivity",
  keywords: [
    "my desktop",
    "управление задачами",
    "менеджер проектов",
    "планировщик задач",
    "todo",
    "kanban",
    "рабочее пространство",
    "продуктивность",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "my desktop",
    title: "my desktop — проекты и задачи в одном пространстве",
    description:
      "Персональное пространство для проектов, задач, Kanban-доски и контроля прогресса.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "my desktop — управление проектами и задачами",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "my desktop — проекты и задачи в одном пространстве",
    description:
      "Персональное пространство для проектов, задач, Kanban-доски и контроля прогресса.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <StoreProvider>
          <DesktopTitlebar />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
