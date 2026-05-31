import { Check, Minus } from "lucide-react";
import type { CheckState } from "../../lib/tristate";

interface Props {
  state: CheckState;
  onClick: (e: React.MouseEvent) => void;
}

export default function TriStateCheckbox({ state, onClick }: Props) {
  const checked = state === "checked";
  const partial = state === "partial";
  const active = checked || partial;

  return (
    <button
      onClick={onClick}
      className="w-4 h-4 rounded-[5px] flex items-center justify-center transition-all cursor-default shrink-0"
      style={{
        background: active ? "var(--color-accent-3)" : "transparent",
        border: active ? "1px solid var(--color-accent-3)" : "1px solid var(--color-border)",
        boxShadow: active ? "0 0 0 2px var(--color-cyan-dim)" : "none",
      }}
    >
      {checked && <Check size={10} strokeWidth={3} color="#06060d" />}
      {partial && <Minus size={10} strokeWidth={3} color="#06060d" />}
    </button>
  );
}
