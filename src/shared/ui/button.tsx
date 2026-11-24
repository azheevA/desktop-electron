import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b12] disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-[#10170e] shadow-glow hover:-translate-y-px hover:bg-[#bbff88]",
        secondary:
          "border border-line bg-[#151e29] text-[#dce5ec] hover:border-[#405163] hover:bg-[#1a2633]",
        ghost: "text-[#9ba9b8] hover:bg-[#1a2633] hover:text-white",
        danger: "bg-[#f08b7618] text-[#f09a86] hover:bg-[#f08b7628]",
        outline:
          "border border-line text-[#c3ccd5] hover:border-[#405163] hover:bg-[#151e29]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-3.5 text-xs",
        lg: "h-11 px-4 text-sm",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
