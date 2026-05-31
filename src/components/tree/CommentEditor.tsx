import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";

interface Props {
  initial: string;
  onSave: (next: string) => void;
  onCancel: () => void;
}

export default function CommentEditor({ initial, onSave, onCancel }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <div
      className="flex items-center gap-1 ml-2 px-1.5 rounded-md"
      style={{
        background: "var(--color-bg-elev)",
        border: "1px solid var(--color-accent-3)",
        boxShadow: "0 0 0 3px var(--color-cyan-dim)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[10px] mono" style={{ color: "var(--color-text-subtle)" }}>#</span>
      <input
        ref={ref}
        defaultValue={initial}
        placeholder="comment"
        className="bg-transparent outline-none text-[11px] mono py-0.5 w-32"
        style={{ color: "var(--color-text)" }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave((e.target as HTMLInputElement).value);
          else if (e.key === "Escape") onCancel();
        }}
        onBlur={(e) => onSave(e.target.value)}
      />
      <button
        onClick={() => onSave(ref.current?.value ?? "")}
        className="w-4 h-4 flex items-center justify-center cursor-default"
        style={{ color: "var(--color-accent-3)" }}
      >
        <Check size={10} />
      </button>
      <button
        onClick={onCancel}
        className="w-4 h-4 flex items-center justify-center cursor-default"
        style={{ color: "var(--color-text-subtle)" }}
      >
        <X size={10} />
      </button>
    </div>
  );
}
