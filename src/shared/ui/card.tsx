import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-gradient-to-br from-[#121a25] to-[#0d131c]",
        className,
      )}
      {...props}
    />
  );
}
