import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib";

const variants = {
  default: "border-[#344252] bg-[#1b2632] text-[#aebbc8]",
  success: "border-[#a5f36b25] bg-[#a5f36b14] text-[#baf58d]",
  warning: "border-[#e8c36f25] bg-[#e8c36f14] text-[#e8c36f]",
  danger: "border-[#f08b7625] bg-[#f08b7614] text-[#f09a86]",
  info: "border-[#66d9e825] bg-[#66d9e814] text-[#83dce7]",
  violet: "border-[#ad91f525] bg-[#ad91f514] text-[#c6b0ff]",
} as const;

export function Badge({
  variant = "default",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold leading-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
