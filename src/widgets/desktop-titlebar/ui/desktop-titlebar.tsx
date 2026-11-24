"use client";

import { useEffect, useState } from "react";
import { Copy, Minus, Square, X } from "lucide-react";

export function DesktopTitlebar() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const desktop = window.desktopApp;
    if (!desktop?.isDesktop) return;
    setIsDesktop(true);
    document.documentElement.classList.add("electron-app");
    desktop
      .getWindowState()
      .then((state) => setIsMaximized(state.isMaximized))
      .catch(() => undefined);
    const unsubscribe = desktop.onMaximizeChange(setIsMaximized);
    return () => {
      unsubscribe();
      document.documentElement.classList.remove("electron-app");
    };
  }, []);

  if (!isDesktop) return null;
  return (
    <div className="electron-drag relative z-50 flex h-10 w-full shrink-0 select-none items-center justify-between border-b border-[#202b39] bg-[#0b1018] pl-3 pr-2">
      <div className="flex items-center gap-2.5">
        <div className="grid size-5 place-items-center rounded-md bg-accent text-[11px] font-black text-[#10170e]">
          m
        </div>
        <span className="text-[10px] font-semibold tracking-wide text-[#9aa7b5]">
          my desktop
        </span>
        <span className="text-[9px] text-[#536174]">·</span>
        <span className="text-[9px] text-[#718094]">Рабочее пространство</span>
      </div>
      <div className="electron-no-drag flex h-full items-center">
        <button
          onClick={() => window.desktopApp?.minimize()}
          className="grid h-full w-11 place-items-center text-[#8b99aa] transition hover:bg-[#ffffff0c] hover:text-white"
          aria-label="Свернуть"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => window.desktopApp?.toggleMaximize()}
          className="grid h-full w-11 place-items-center text-[#8b99aa] transition hover:bg-[#ffffff0c] hover:text-white"
          aria-label={isMaximized ? "Восстановить" : "Развернуть"}
        >
          {isMaximized ? <Copy size={12} /> : <Square size={12} />}
        </button>
        <button
          onClick={() => window.desktopApp?.close()}
          className="grid h-full w-12 place-items-center text-[#8b99aa] transition hover:bg-[#e45d5d] hover:text-white"
          aria-label="Закрыть"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
