import * as React from "react";
import { cn } from "@/shared/lib";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-24 w-full resize-y rounded-lg border border-[#2b3947] bg-[#0b121b] px-3 py-2.5 text-sm text-[#eaf0f4] outline-none transition placeholder:text-[#667488] hover:border-[#405163] focus:border-accent/70 focus:ring-2 focus:ring-accent/10",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
