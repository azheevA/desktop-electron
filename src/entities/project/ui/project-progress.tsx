import { CheckCircle2, CircleDashed } from "lucide-react";
import type { ProjectColor } from "../model/project-types";

const colorMap: Record<ProjectColor, { bar: string; text: string; icon: string }> = {
  lime: { bar: "bg-accent", text: "text-[#baf58d]", icon: "bg-[#a5f36b1b] text-[#baf58d]" },
  cyan: { bar: "bg-cyan", text: "text-[#7fe4ee]", icon: "bg-[#66d9e81b] text-[#7fe4ee]" },
  violet: { bar: "bg-[#ad91f5]", text: "text-[#c4a6ff]", icon: "bg-[#ad91f51b] text-[#c4a6ff]" },
  orange: { bar: "bg-[#f0a36c]", text: "text-[#f0b58c]", icon: "bg-[#f0a36c1b] text-[#f0b58c]" },
};

export function ProjectProgress({ color, progress, completedCount, taskCount }: { color: ProjectColor; progress: number; completedCount: number; taskCount: number }) {
  const palette = colorMap[color];
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-[10px]">
        <span className="text-[#8290a1]">Выполнение задач</span>
        <strong className={`font-mono text-xs ${palette.text}`}>{progress}%</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#26313b]">
        <div className={`h-full rounded-full transition-[width] duration-500 ${palette.bar}`} style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-[#718094]">
        {taskCount > 0 ? <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} className={palette.text} /> {completedCount} из {taskCount} задач выполнено</span> : <span className="inline-flex items-center gap-1.5"><CircleDashed size={12} /> Пока нет задач</span>}
        <span>{taskCount - completedCount} осталось</span>
      </div>
    </div>
  );
}
