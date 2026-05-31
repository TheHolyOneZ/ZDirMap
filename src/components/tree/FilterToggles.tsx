import { useStore } from "../../store";
import clsx from "clsx";

interface Toggle {
  key: string;
  label: string;
  value: boolean;
  set: (v: boolean) => void;
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all cursor-default",
      )}
      style={{
        background: active ? "var(--color-accent-dim)" : "var(--color-panel)",
        border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
        color: active ? "var(--color-text)" : "var(--color-text-muted)",
      }}
    >
      {children}
    </button>
  );
}

export default function FilterToggles() {
  const o = useStore((s) => s.options);
  const setOption = useStore((s) => s.setOption);

  const toggles: Toggle[] = [
    { key: "filesOnly", label: "Files only", value: o.filesOnly, set: (v) => setOption("filesOnly", v) },
    { key: "foldersOnly", label: "Folders only", value: o.foldersOnly, set: (v) => setOption("foldersOnly", v) },
    { key: "hideDotfiles", label: "Hide dotfiles", value: o.hideDotfiles, set: (v) => setOption("hideDotfiles", v) },
    { key: "trailingSlash", label: "Trailing /", value: o.trailingSlash, set: (v) => setOption("trailingSlash", v) },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: "var(--color-text-subtle)" }}>
        Output filters
      </div>
      <div className="flex flex-wrap gap-1.5">
        {toggles.map((t) => (
          <Pill key={t.key} active={t.value} onClick={() => t.set(!t.value)}>
            {t.label}
          </Pill>
        ))}
      </div>
    </div>
  );
}
