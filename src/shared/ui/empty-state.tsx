import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-[#34434d] bg-[#17212d] text-accent">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-[#e4ebf1]">{title}</h3>
      <p className="mt-2 max-w-sm text-xs leading-6 text-[#8290a1]">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
