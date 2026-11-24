"use client";

import {
  ArrowUpRight,
  BarChart3,
  CheckSquare,
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  Pencil,
  Settings2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib";
import type { UserProfile } from "@/entities/profile";

type Props = {
  active: string;
  onChange: (value: string) => void;
  taskCount: number;
  profile: UserProfile;
  onEditProfile: () => void;
};
const primary = [
  { label: "Обзор", icon: LayoutDashboard },
  { label: "Проекты", icon: FolderKanban },
  { label: "Задачи", icon: CheckSquare },
  { label: "Аналитика", icon: BarChart3 },
];

export function Sidebar({
  active,
  onChange,
  taskCount,
  profile,
  onEditProfile,
}: Props) {
  const initials =
    `${profile.firstName.slice(0, 1)}${profile.lastName.slice(0, 1)}`.toLocaleUpperCase(
      "ru",
    );
  return (
    <aside className="sidebar-shell flex min-h-0 w-[clamp(232px,14vw,292px)] shrink-0 flex-col border-r border-line bg-[#0b1018]/90 px-[clamp(14px,1vw,22px)] py-[clamp(20px,2.2vh,32px)] max-[850px]:w-[68px] max-[850px]:px-[9px] max-[850px]:py-[22px]">
      <div className="flex items-center gap-2.5 px-[11px] max-[850px]:px-[10px]">
        <div className="grid size-[29px] place-items-center rounded-[9px] bg-accent text-[#0c130b] shadow-glow">
          <span className="text-[17px] font-extrabold tracking-[-.06em]">
            m
          </span>
        </div>
        <span className="text-[clamp(14px,.9vw,17px)] font-extrabold tracking-[.13em] max-[850px]:hidden">
          my desktop<span className="text-accent">.</span>
        </span>
      </div>
      <div className="mb-[clamp(22px,2.5vh,34px)] mt-[clamp(28px,3.6vh,48px)] flex items-center gap-[9px] rounded-[10px] border border-[#263342] bg-[#111923] p-2.5 max-[850px]:my-7 max-[850px]:justify-center max-[850px]:border-0 max-[850px]:bg-transparent max-[850px]:px-0">
        <div className="grid size-[31px] shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#baf58d] to-[#4f9872] text-[13px] font-extrabold text-[#111a10]">
          М
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[3px] max-[850px]:hidden">
          <strong className="text-[11px]">Моё пространство</strong>
          <span className="text-[10px] text-muted">Личный кабинет</span>
        </div>
        <ArrowUpRight size={15} className="text-[#718094] max-[850px]:hidden" />
      </div>
      <div className="mb-3 px-[11px] font-mono text-[9px] tracking-[.13em] text-[#718094] max-[850px]:hidden">
        РАБОЧЕЕ ПРОСТРАНСТВО
      </div>
      <nav className="grid gap-1" aria-label="Основная навигация">
        {primary.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onChange(label)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-[11px] text-left text-[12px] transition hover:bg-[#151e29] hover:text-[#eef5ed] max-[850px]:justify-center max-[850px]:px-0 max-[850px]:py-3",
              active === label
                ? "bg-[#18251b] text-[#b8f38c] shadow-[inset_2px_0_#a5f36b] max-[850px]:shadow-[inset_0_-2px_#a5f36b]"
                : "text-[#8d9bad]",
            )}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span className="max-[850px]:hidden">{label}</span>
            {label === "Задачи" && (
              <span className="ml-auto font-mono text-[10px] text-accent max-[850px]:hidden">
                {taskCount}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="mb-3 mt-[34px] px-[11px] font-mono text-[9px] tracking-[.13em] text-[#718094] max-[850px]:hidden">
        НАСТРОЙКИ
      </div>
      <nav className="grid gap-1">
        <button
          onClick={() => onChange("Настройки")}
          className="flex items-center gap-3 rounded-lg px-3 py-[11px] text-left text-[12px] text-[#8d9bad] transition hover:bg-[#151e29] hover:text-[#eef5ed] max-[850px]:justify-center max-[850px]:px-0"
        >
          <Settings2 size={17} />
          <span className="max-[850px]:hidden">Настройки</span>
        </button>
        <button
          onClick={() => onChange("Справка")}
          className="flex items-center gap-3 rounded-lg px-3 py-[11px] text-left text-[12px] text-[#8d9bad] transition hover:bg-[#151e29] hover:text-[#eef5ed] max-[850px]:justify-center max-[850px]:px-0"
        >
          <CircleHelp size={17} />
          <span className="max-[850px]:hidden">Справка</span>
        </button>
      </nav>
      <div className="mt-auto pt-6 max-[850px]:hidden">
        <div className="rounded-[11px] border border-[#29383a] bg-gradient-to-br from-[#17251d] to-[#111923] p-[15px]">
          <div className="mb-3 grid size-[27px] place-items-center rounded-lg bg-[#a5f36b18] text-accent">
            <Sparkles size={16} />
          </div>
          <strong className="text-[11px]">Больше возможностей</strong>
          <p className="my-[7px] text-[10px] leading-relaxed text-muted">
            Больше пространства для ваших идей и проектов.
          </p>
          <button
            onClick={() => onChange("Тарифы")}
            className="flex items-center gap-1.5 text-[10px] font-bold text-[#b9f38f]"
          >
            Посмотреть тарифы <ArrowUpRight size={13} />
          </button>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          title="Изменить профиль"
          aria-label="Изменить профиль"
          className="group mt-[18px] flex w-full items-center gap-[9px] border-t border-line px-1 pt-[17px] text-left"
        >
          <span className="grid size-[31px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6c8495] to-[#3c4b5a] text-[9px] font-extrabold">
            {initials}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <strong className="truncate text-[11px]">
              {profile.lastName} {profile.firstName}
            </strong>
            <span className="text-[10px] text-muted">Личный профиль</span>
          </span>
          <Pencil
            size={14}
            className="text-[#718094] transition group-hover:text-accent"
          />
        </button>
      </div>
    </aside>
  );
}
