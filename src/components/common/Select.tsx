import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Option<T extends string> { value: T; label: string }
interface Props<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  prefix?: string;
  width?: number | string;
}

export default function Select<T extends string>({ value, options, onChange, prefix, width }: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative" style={{ width }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-7 px-2.5 rounded-lg text-[11px] font-medium cursor-default flex items-center gap-1.5 w-full justify-between"
        style={{
          background: "var(--color-panel)",
          border: `1px solid ${open ? "var(--color-accent-3)" : "var(--color-border)"}`,
          color: "var(--color-text-muted)",
        }}
      >
        <span className="truncate">
          {prefix ? <span style={{ color: "var(--color-text-subtle)" }}>{prefix} </span> : null}
          <span style={{ color: "var(--color-text)" }}>{current?.label}</span>
        </span>
        <ChevronDown size={10} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 160ms var(--ease-out)" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 right-0 mt-1 z-50 rounded-lg overflow-hidden glass p-1"
            style={{ boxShadow: "0 10px 32px -12px rgba(0,0,0,0.6)" }}
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className="w-full h-7 px-2 rounded-md text-[11px] cursor-default flex items-center justify-between gap-2"
                  style={{
                    background: active ? "var(--color-cyan-dim)" : "transparent",
                    color: active ? "var(--color-accent-3)" : "var(--color-text-muted)",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--color-panel-hover)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <span>{o.label}</span>
                  {active && <Check size={10} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
