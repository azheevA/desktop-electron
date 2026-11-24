"use client";

import { Filter, Search, X } from "lucide-react";
import { Button, Input, Select } from "@/shared/ui";
import type { SelectOption } from "@/shared/ui/select";

export type TaskFilterValues = {
  search: string;
  status: string;
  priority: string;
  project: string;
  sort: string;
};

const statusOptions = [
  { value: "all", label: "Все статусы" },
  { value: "todo", label: "К выполнению" },
  { value: "in-progress", label: "В работе" },
  { value: "review", label: "На проверке" },
  { value: "done", label: "Готово" },
];
const priorityOptions = [
  { value: "all", label: "Любой приоритет" },
  { value: "urgent", label: "Срочный" },
  { value: "high", label: "Высокий" },
  { value: "medium", label: "Средний" },
  { value: "low", label: "Низкий" },
];
const sortOptions = [
  { value: "due", label: "Сначала ближайшие сроки" },
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "priority", label: "По приоритету" },
  { value: "title", label: "По названию" },
];

export function TaskFilterBar({
  value,
  onChange,
  projects,
  onReset,
  hasFilters,
}: {
  value: TaskFilterValues;
  onChange: (value: TaskFilterValues) => void;
  projects: SelectOption[];
  onReset: () => void;
  hasFilters: boolean;
}) {
  const update = (key: keyof TaskFilterValues, next: string) =>
    onChange({ ...value, [key]: next });
  return (
    <div className="rounded-xl border border-line bg-[#101720] p-3">
      <div className="grid grid-cols-[minmax(180px,1.5fr)_repeat(3,minmax(140px,1fr))] gap-2.5 2xl:grid-cols-[minmax(240px,1.7fr)_repeat(3,minmax(170px,1fr))] max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68778a]"
          />
          <Input
            value={value.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Найти задачу..."
            className="pl-9"
            aria-label="Поиск задач"
          />
        </div>
        <Select
          value={value.status}
          onValueChange={(next) => update("status", next)}
          options={statusOptions}
        />
        <Select
          value={value.priority}
          onValueChange={(next) => update("priority", next)}
          options={priorityOptions}
        />
        <Select
          value={value.project}
          onValueChange={(next) => update("project", next)}
          options={[
            { value: "all", label: "Все проекты" },
            { value: "none", label: "Без проекта" },
            ...projects,
          ]}
        />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] text-[#758498]">
          <Filter size={13} /> Сортировка
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[230px] max-[560px]:w-full">
            <Select
              value={value.sort}
              onValueChange={(next) => update("sort", next)}
              options={sortOptions}
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X size={13} /> Сбросить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
