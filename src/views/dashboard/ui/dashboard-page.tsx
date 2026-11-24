"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Plus,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAppSelector } from "@/shared/lib";
import { selectTasks, selectTaskStats } from "@/entities/task";
import { selectProjects, selectProjectsWithStats } from "@/entities/project";
import type { Task } from "@/entities/task";
import { TaskPriorityBadge, TaskStatusBadge } from "@/entities/task";
import { Badge, Button, Card } from "@/shared/ui";
import { TaskManager } from "@/widgets/task-manager";
import { ProjectManager } from "@/widgets/project-manager";
import { Sidebar } from "@/widgets/sidebar";
import { Topbar } from "@/widgets/topbar";
import { chartSets } from "@/views/dashboard/model/data";
import { selectProfile } from "@/entities/profile";
import { ProfileFormDialog } from "@/features/profile-edit";
import type { NotificationItem } from "@/entities/notification";

const navTitles: Record<string, string> = {
  Обзор: "Обзор",
  Проекты: "Проекты",
  Задачи: "Задачи",
  Аналитика: "Аналитика",
  Настройки: "Настройки",
  Справка: "Справка",
  Тарифы: "Тарифы",
};

function StatCard({
  label,
  value,
  note,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className="min-h-[clamp(112px,11vh,164px)] p-[clamp(14px,1.1vw,24px)]">
      <div className="flex items-center justify-between gap-2 text-[clamp(10px,.72vw,13px)] text-[#8b99aa]">
        <span>{label}</span>
        <span className="grid size-[29px] shrink-0 place-items-center rounded-lg bg-[#a5f36b12] text-accent">
          {icon}
        </span>
      </div>
      <strong
        className={`mt-3 block text-[clamp(24px,1.75vw,36px)] tracking-[-.05em] ${accent ? "text-accent" : "text-[#edf2f7]"}`}
      >
        {value}
      </strong>
      <div className="mt-1 text-[9px] text-[#647387]">{note}</div>
    </Card>
  );
}

function TaskPreview({
  task,
  projectName,
  onOpen,
}: {
  task: Task;
  projectName: string;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="grid w-full grid-cols-[minmax(0,1.5fr)_auto_auto] items-center gap-3 border-b border-[#1b2632] px-4 py-3 text-left transition last:border-0 hover:bg-[#17212c] max-[700px]:grid-cols-[minmax(0,1fr)_auto]"
    >
      <span className="min-w-0">
        <strong
          className={`block truncate text-xs font-semibold ${task.status === "done" ? "text-[#8290a1] line-through" : "text-[#dbe4eb]"}`}
        >
          {task.title}
        </strong>
        <span className="mt-1 block truncate text-[10px] text-[#718094]">
          {projectName}
        </span>
      </span>
      <span className="max-[700px]:hidden">
        <TaskPriorityBadge priority={task.priority} />
      </span>
      <TaskStatusBadge status={task.status} />
    </button>
  );
}

export default function Dashboard() {
  const tasks = useAppSelector(selectTasks);
  const stats = useAppSelector(selectTaskStats);
  const projects = useAppSelector(selectProjects);
  const projectSummaries = useAppSelector(selectProjectsWithStats);
  const profile = useAppSelector(selectProfile);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [active, setActive] = useState("Обзор");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<keyof typeof chartSets>("week");
  const [createSignal, setCreateSignal] = useState(0);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<
    string | null
  >(null);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>("#global-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  const projectNames = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );
  const handleNavigation = (value: string) => {
    setSelectedProjectFilter(null);
    setActive(value);
  };
  const filteredProjects = useMemo(
    () =>
      projectSummaries.filter((project) =>
        `${project.name} ${project.description}`
          .toLocaleLowerCase("ru")
          .includes(search.toLocaleLowerCase("ru")),
      ),
    [projectSummaries, search],
  );
  const previewTasks = useMemo(
    () =>
      tasks
        .filter((task) =>
          `${task.title} ${task.projectId ? (projectNames.get(task.projectId) ?? "") : "Без проекта"} ${task.description}`
            .toLocaleLowerCase("ru")
            .includes(search.toLocaleLowerCase("ru")),
        )
        .slice(0, 5),
    [tasks, projectNames, search],
  );
  const taskProgress = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;
  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Доброе утро"
      : today.getHours() < 18
        ? "Добрый день"
        : "Добрый вечер";

  return (
    <>
      <main className="app-shell flex min-h-0 flex-1 bg-[radial-gradient(ellipse_at_68%_-15%,rgba(44,68,65,.17),transparent_42%),#080b12]">
        <Sidebar
          active={active}
          onChange={handleNavigation}
          taskCount={stats.active}
          profile={profile}
          onEditProfile={() => setProfileDialogOpen(true)}
        />
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Topbar
            title={navTitles[active] ?? active}
            search={search}
            onSearch={setSearch}
            onOpenNotification={(notification: NotificationItem) => {
              setSelectedProjectFilter(null);
              setActive(
                notification.entityType === "project" ? "Проекты" : "Задачи",
              );
            }}
          />
          <div className="content-scroll-area w-full px-[clamp(22px,3vw,64px)] pb-[clamp(22px,3vh,38px)] pt-[clamp(28px,3.5vh,48px)] max-[620px]:px-[15px] max-[620px]:pt-[27px]">
            {active === "Задачи" ? (
              <TaskManager
                globalSearch={search}
                openSignal={createSignal}
                onOpenSignalHandled={() => setCreateSignal(0)}
                initialProjectId={selectedProjectFilter}
              />
            ) : active === "Проекты" ? (
              <ProjectManager
                globalSearch={search}
                onOpenTasks={(projectId) => {
                  setSelectedProjectFilter(projectId);
                  setActive("Задачи");
                }}
              />
            ) : (
              <>
                <div className="mb-[clamp(22px,3vh,36px)] flex items-end justify-between gap-3 max-[620px]:items-start">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[9px] tracking-[.13em] text-[#718094]">
                      <span className="h-px w-[17px] bg-accent" />
                      {new Intl.DateTimeFormat("ru-RU", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                        .format(today)
                        .toLocaleUpperCase("ru")}
                    </div>
                    <h1 className="mb-[5px] mt-[11px] text-[clamp(25px,2.35vw,42px)] font-bold leading-tight tracking-[-.055em]">
                      {active === "Обзор"
                        ? `${greeting}, ${profile.firstName}`
                        : active}
                      <span className="text-accent">.</span>
                    </h1>
                    <p className="m-0 text-[clamp(11px,.82vw,14px)] text-muted">
                      {active === "Обзор"
                        ? "Вот что происходит в вашем рабочем пространстве сегодня."
                        : `Все важное в разделе «${active.toLocaleLowerCase("ru")}».`}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setActive("Задачи");
                      setCreateSignal((value) => value + 1);
                    }}
                    className="max-[620px]:size-9 max-[620px]:px-0"
                  >
                    <Plus size={16} />
                    <span className="max-[620px]:hidden">Создать задачу</span>
                  </Button>
                </div>
                {(active === "Обзор" || active === "Аналитика") && (
                  <>
                    <div className="grid grid-cols-4 gap-[clamp(9px,.9vw,18px)] max-[850px]:grid-cols-2 max-[620px]:gap-[9px]">
                      <StatCard
                        label="Всего задач"
                        value={String(stats.total)}
                        note="Во всех проектах"
                        icon={<Target size={17} />}
                      />
                      <StatCard
                        label="Завершено"
                        value={String(stats.completed)}
                        note={`${taskProgress}% от общего числа`}
                        icon={<Check size={17} />}
                        accent
                      />
                      <StatCard
                        label="В работе"
                        value={String(
                          tasks.filter((task) => task.status === "in-progress")
                            .length,
                        )}
                        note="Активный процесс"
                        icon={<TrendingUp size={17} />}
                      />
                      <StatCard
                        label="Просрочено"
                        value={String(stats.overdue)}
                        note="Требуют внимания"
                        icon={<Users size={17} />}
                      />
                    </div>
                    <div className="mt-[clamp(12px,1.2vw,22px)] grid grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)] gap-[clamp(12px,1vw,20px)] max-[850px]:grid-cols-1">
                      <Card className="p-[clamp(16px,1.25vw,28px)]">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-mono text-[9px] tracking-[.13em] text-[#718094]">
                              АКТИВНОСТЬ
                            </div>
                            <h2 className="mt-1.5 text-sm font-bold">
                              Активность пространства
                            </h2>
                          </div>
                          <div className="flex gap-[3px] rounded-md border border-line bg-[#0b1119] p-[3px]">
                            {(["week", "month", "year"] as const).map(
                              (item) => (
                                <button
                                  key={item}
                                  onClick={() => setPeriod(item)}
                                  className={`rounded px-2 py-[5px] font-mono text-[9px] ${period === item ? "bg-[#243321] text-[#c5f69f]" : "text-[#718094]"}`}
                                >
                                  {item === "week"
                                    ? "Неделя"
                                    : item === "month"
                                      ? "Месяц"
                                      : "Год"}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                        <div className="mt-5 flex items-center gap-2">
                          <strong className="text-2xl tracking-tight">
                            {stats.total.toLocaleString("ru-RU")}
                          </strong>
                          <span className="text-[9px] text-[#718094]">
                            Задач в пространстве
                          </span>
                        </div>
                        <div className="mt-4 flex h-[clamp(150px,22vh,300px)] gap-3">
                          <div className="flex flex-col justify-between pb-px font-mono text-[8px] text-[#627185]">
                            <span>100</span>
                            <span>75</span>
                            <span>50</span>
                            <span>25</span>
                            <span>0</span>
                          </div>
                          <div className="relative flex-1">
                            <div className="absolute inset-0 flex flex-col justify-between">
                              {[1, 2, 3, 4, 5].map((line) => (
                                <i key={line} className="block h-px bg-line" />
                              ))}
                            </div>
                            <div className="absolute inset-x-[1%] bottom-0 top-0 flex items-end justify-around gap-2">
                              {chartSets[period].map((height, index) => (
                                <div
                                  key={index}
                                  className="flex h-full flex-1 items-end"
                                >
                                  <div
                                    className={`w-full max-w-7 rounded-t-[4px] transition-all ${index === 7 ? "bg-gradient-to-b from-[#c1ff8b] to-[#6ca74d] shadow-[0_0_17px_#a5f36b26]" : "bg-gradient-to-b from-[#537b50] to-[#273b32] opacity-80"}`}
                                    style={{ height: `${height}%` }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="ml-7 mt-2 flex justify-between font-mono text-[8px] text-[#667589]">
                          <span>Пн</span>
                          <span>Вт</span>
                          <span>Ср</span>
                          <span>Чт</span>
                          <span>Пт</span>
                          <span>Сб</span>
                          <span>Вс</span>
                        </div>
                      </Card>
                      <Card className="flex flex-col p-[clamp(16px,1.25vw,28px)]">
                        <div>
                          <div className="font-mono text-[9px] tracking-[.13em] text-[#718094]">
                            ВАШ РЕЗУЛЬТАТ
                          </div>
                          <h2 className="mt-1.5 text-sm font-bold">
                            Выполнение задач
                          </h2>
                        </div>
                        <div
                          className="relative mx-auto my-6 grid size-[clamp(140px,10vw,190px)] place-items-center rounded-full"
                          style={{
                            background: `conic-gradient(#a5f36b 0 ${taskProgress}%,#26343b ${taskProgress}% 100%)`,
                          }}
                        >
                          <div className="absolute inset-2 rounded-full bg-[#111923]" />
                          <div className="relative flex flex-col items-center">
                            <strong className="text-3xl tracking-tight">
                              {taskProgress}
                              <span className="text-sm text-accent">%</span>
                            </strong>
                            <span className="font-mono text-[8px] tracking-widest text-[#77869a]">
                              ЗАВЕРШЕНО
                            </span>
                          </div>
                        </div>
                        <p className="text-center text-[10px] text-[#8a98a9]">
                          {stats.completed} из {stats.total} задач выполнено.{" "}
                          {stats.overdue
                            ? `Осталось разобрать ${stats.overdue} просроченных.`
                            : "Продолжайте в том же духе!"}
                        </p>
                        <div className="mt-auto space-y-3 pt-5">
                          <div>
                            <div className="mb-1.5 flex justify-between text-[9px] text-[#9aa7b5]">
                              <span>К выполнению</span>
                              <strong>
                                {
                                  tasks.filter((task) => task.status === "todo")
                                    .length
                                }
                              </strong>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full bg-[#26313b]">
                              <div
                                className="h-full rounded-full bg-[#718094]"
                                style={{
                                  width: `${stats.total ? (tasks.filter((task) => task.status === "todo").length / stats.total) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-1.5 flex justify-between text-[9px] text-[#9aa7b5]">
                              <span>На проверке</span>
                              <strong>{stats.review}</strong>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full bg-[#26313b]">
                              <div
                                className="h-full rounded-full bg-[#e8c36f]"
                                style={{
                                  width: `${stats.total ? (stats.review / stats.total) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </>
                )}
                {active === "Обзор" && (
                  <section className="mt-[clamp(26px,3vh,40px)]">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[9px] tracking-[.13em] text-[#718094]">
                          ВАША РАБОТА
                        </div>
                        <h2 className="mt-1.5 text-sm font-bold">
                          Активные проекты{" "}
                          <Badge className="ml-1">
                            {filteredProjects.length}
                          </Badge>
                        </h2>
                      </div>
                      <button
                        onClick={() => setActive("Проекты")}
                        className="inline-flex items-center gap-1.5 text-[10px] text-accent"
                      >
                        Все проекты <ArrowRight size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 2xl:grid-cols-4 max-[1050px]:grid-cols-2 max-[560px]:grid-cols-1">
                      {filteredProjects.slice(0, 4).map((project) => (
                        <Card
                          key={project.id}
                          className="flex min-h-[clamp(170px,17vh,240px)] flex-col p-4 transition hover:-translate-y-0.5 hover:border-[#40534a]"
                        >
                          <div className="flex items-start justify-between">
                            <div
                              className={`grid size-9 place-items-center rounded-xl text-sm font-bold ${project.color === "lime" ? "bg-[#a5f36b1b] text-[#baf58d]" : project.color === "cyan" ? "bg-[#66d9e81b] text-[#7fe4ee]" : project.color === "violet" ? "bg-[#ad91f51b] text-[#c4a6ff]" : "bg-[#f0a36c1b] text-[#f0b58c]"}`}
                            >
                              {project.name.slice(0, 1)}
                            </div>
                            <Badge>{project.taskCount} задач</Badge>
                          </div>
                          <div className="mt-4 text-[9px] text-[#748397]">
                            {project.description || "Рабочий проект"}
                          </div>
                          <h3 className="mt-1 text-xs font-bold">
                            {project.name}
                          </h3>
                          <div className="mb-2 mt-4 flex justify-between text-[9px] text-[#8492a4]">
                            <span>
                              Выполнено: {project.completedCount} из{" "}
                              {project.taskCount}
                            </span>
                            <strong className="font-mono text-[#e2e9ef]">
                              {project.progress}%
                            </strong>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-[#26313b]">
                            <div
                              className={`h-full rounded-full ${project.color === "lime" ? "bg-accent" : project.color === "cyan" ? "bg-cyan" : project.color === "violet" ? "bg-[#ad91f5]" : "bg-[#f0a36c]"}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-4">
                            <span className="text-[9px] text-[#718094]">
                              {project.taskCount === 0
                                ? "Ожидает задач"
                                : `${project.taskCount - project.completedCount} осталось`}
                            </span>
                            <button
                              onClick={() => setActive("Проекты")}
                              className="text-[9px] text-accent hover:underline"
                            >
                              Открыть проект
                            </button>
                          </div>
                        </Card>
                      ))}
                      {filteredProjects.length === 0 && (
                        <Card className="col-span-full p-6 text-center text-xs text-[#8290a1]">
                          Пока нет проектов. Создайте первый в разделе
                          «Проекты».
                        </Card>
                      )}
                    </div>
                  </section>
                )}
                {(active === "Обзор" || active === "Задачи") && (
                  <section className="mt-[clamp(26px,3vh,40px)]">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[9px] tracking-[.13em] text-[#718094]">
                          НЕ ТЕРЯЙТЕ ФОКУС
                        </div>
                        <h2 className="mt-1.5 text-sm font-bold">
                          Последние задачи{" "}
                          <Badge className="ml-1">{previewTasks.length}</Badge>
                        </h2>
                      </div>
                      <button
                        onClick={() => setActive("Задачи")}
                        className="inline-flex items-center gap-1.5 text-[10px] text-accent"
                      >
                        Открыть менеджер <ArrowRight size={14} />
                      </button>
                    </div>
                    <Card className="overflow-hidden">
                      {previewTasks.length ? (
                        previewTasks.map((task) => (
                          <TaskPreview
                            key={task.id}
                            task={task}
                            projectName={
                              task.projectId
                                ? (projectNames.get(task.projectId) ??
                                  "Без проекта")
                                : "Без проекта"
                            }
                            onOpen={() => setActive("Задачи")}
                          />
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-[#8290a1]">
                          По вашему запросу ничего не найдено.
                        </div>
                      )}
                    </Card>
                  </section>
                )}
                {!["Обзор", "Проекты", "Аналитика", "Задачи"].includes(
                  active,
                ) && (
                  <Card className="mt-8 max-w-2xl p-8">
                    <div className="grid size-11 place-items-center rounded-xl bg-[#a5f36b17] text-accent">
                      <Target size={23} />
                    </div>
                    <h2 className="mt-4 text-xl font-bold">{active}</h2>
                    <p className="mt-2 max-w-md text-xs leading-6 text-[#8a98a9]">
                      Этот раздел подготовлен для новых возможностей. Управление
                      задачами и аналитика уже доступны.
                    </p>
                    <Button className="mt-5" onClick={() => setActive("Обзор")}>
                      Вернуться к обзору <ArrowRight size={14} />
                    </Button>
                  </Card>
                )}
                <footer className="mt-auto flex justify-between gap-3 pt-[clamp(24px,3vh,42px)] font-mono text-[8px] tracking-[.08em] text-[#536174] max-[620px]:flex-wrap">
                  <span>© 2026 MY DESKTOP</span>
                  <span className="inline-flex items-center gap-[7px]">
                    <i className="size-[5px] rounded-full bg-accent shadow-[0_0_6px_#a5f36b]" />{" "}
                    ВСЕ СИСТЕМЫ РАБОТАЮТ
                  </span>
                  <span className="max-[620px]:hidden">СОЗДАНО ДЛЯ ФОКУСА</span>
                </footer>
              </>
            )}
          </div>
        </section>
      </main>
      <ProfileFormDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </>
  );
}
