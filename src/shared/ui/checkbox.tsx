"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="grid size-[17px] shrink-0 place-items-center rounded border border-[#465462] bg-[#0b121b] text-[#10170e] outline-none transition data-[state=checked]:border-accent data-[state=checked]:bg-accent focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <CheckboxPrimitive.Indicator>
          <Check size={12} strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label htmlFor={id} className="cursor-pointer text-xs text-[#bdc8d2]">
          {label}
        </label>
      )}
    </div>
  );
}
