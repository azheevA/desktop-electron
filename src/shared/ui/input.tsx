import * as React from "react";
import { cn } from "@/shared/lib";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-lg border border-[#2b3947] bg-[#0b121b] px-3 text-sm text-[#eaf0f4] outline-none transition placeholder:text-[#667488] hover:border-[#405163] focus:border-accent/70 focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
