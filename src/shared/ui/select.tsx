"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/shared/lib";

export type SelectOption = { label: string; value: string };

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[#2b3947] bg-[#0b121b] px-3 text-sm text-[#dce5ec] outline-none transition hover:border-[#405163] focus:ring-2 focus:ring-accent/10 disabled:opacity-50",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={15} className="text-[#718094]" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[100] max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-[#344252] bg-[#111923] p-1 shadow-xl"
        >
          <SelectPrimitive.ScrollUpButton className="flex justify-center py-1 text-[#718094]">
            <ChevronUp size={14} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-xs text-[#c3ccd5] outline-none data-[highlighted]:bg-[#202b39] data-[highlighted]:text-white data-[state=checked]:text-accent"
              >
                <span className="absolute left-2 inline-flex size-4 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check size={13} />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex justify-center py-1 text-[#718094]">
            <ChevronDown size={14} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
