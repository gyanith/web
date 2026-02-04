"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronRight } from "lucide-react";
import { unispace } from "@/fonts/fonts";

interface RetroSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export default function RetroSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
}: RetroSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={`w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 flex justify-between items-center focus:outline-none focus:border-[#d4a574] data-[state=open]:border-[#d4a574] transition-colors rounded-none font-mono text-sm group ${className}`}
      >
        <Select.Value
          placeholder={<span className="text-zinc-500">{placeholder}</span>}
        />
        <Select.Icon>
          <ChevronRight className="w-4 h-4 text-[#d4a574] rotate-90 transition-transform duration-300 group-data-[state=open]:rotate-[-90deg]" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="bg-[#070a10] border border-[#d4a574]/30 rounded-none shadow-[0_0_50px_rgba(212,165,116,0.1)] overflow-hidden z-[100]"
          position="popper"
          sideOffset={5}
          style={{ width: "var(--radix-select-trigger-width)" }}
        >
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={`
                  relative flex items-center justify-between h-10 px-4 text-sm font-mono 
                  text-zinc-400 select-none outline-none cursor-pointer duration-200
                  data-[highlighted]:bg-[#d4a574] data-[highlighted]:text-black
                  data-[state=checked]:text-[#d4a574] data-[state=checked]:data-[highlighted]:text-black
                  ${unispace.className}
                `}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="w-3 h-3" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
