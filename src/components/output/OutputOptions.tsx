import { useStore } from "../../store";
import Select from "../common/Select";
import clsx from "clsx";

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={clsx("h-7 px-2.5 rounded-lg text-[11px] font-medium cursor-default transition-all")}
      style={{
        background: active ? "var(--color-accent-dim)" : "var(--color-panel)",
        border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
        color: active ? "var(--color-text)" : "var(--color-text-muted)",
      }}
    >
      {label}
    </button>
  );
}

export default function OutputOptions() {
  const o = useStore((s) => s.options);
  const setOption = useStore((s) => s.setOption);
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: "var(--color-text-subtle)" }}>
        Annotations
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Toggle active={o.showSizes} onClick={() => setOption("showSizes", !o.showSizes)} label="Sizes" />
        <Toggle active={o.showMtime} onClick={() => setOption("showMtime", !o.showMtime)} label="Modified" />
        <Toggle active={o.showLines} onClick={() => setOption("showLines", !o.showLines)} label="Lines" />
      </div>
      <Select<"name" | "size" | "mtime">
        value={o.sort}
        onChange={(v) => setOption("sort", v)}
        prefix="Sort:"
        options={[
          { value: "name", label: "Name" },
          { value: "size", label: "Size" },
          { value: "mtime", label: "Modified" },
        ]}
      />
    </div>
  );
}
