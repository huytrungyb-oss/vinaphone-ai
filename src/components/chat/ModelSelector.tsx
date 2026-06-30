"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import { AVAILABLE_MODELS, type ModelId } from "@/lib/models";

type Props = {
  value: string;
  onChange: (modelId: ModelId) => void;
  isGuest: boolean;
};

export default function ModelSelector({ value, onChange, isGuest }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = AVAILABLE_MODELS.find((m) => m.id === value) ?? AVAILABLE_MODELS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm border border-(--vnp-gray-200) rounded-lg px-3 py-1.5 bg-white hover:border-(--vnp-blue) transition-colors"
      >
        <span>{current.label}</span>
        {current.pro && (
          <span className="text-[10px] font-bold text-(--vnp-red) animate-pulse">PRO</span>
        )}
        <ChevronDown size={14} className="text-(--vnp-gray-700)" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-72 bg-white border border-(--vnp-gray-200) rounded-lg shadow-lg z-20 py-1 max-h-80 overflow-y-auto">
          {AVAILABLE_MODELS.map((m) => {
            const locked = isGuest && m.pro;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-(--vnp-gray-100) transition-colors ${
                  m.id === value ? "bg-(--vnp-blue)/5 text-(--vnp-blue)" : "text-(--vnp-gray-900)"
                }`}
              >
                <span className="flex items-center gap-2">
                  {m.label}
                  {m.pro && (
                    <span className="text-[10px] font-bold text-(--vnp-red) animate-pulse">PRO</span>
                  )}
                </span>
                {locked && <Lock size={13} className="text-(--vnp-gray-700) shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
