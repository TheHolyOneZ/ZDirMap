import { AlignLeft, List, Braces, FileText, Squircle, FileSpreadsheet, Code2, GitBranch, FileCode2 } from "lucide-react";
import { useStore } from "../../store";
import type { OutputFormat } from "../../types/domain";
import clsx from "clsx";

const TABS: { key: OutputFormat; label: string; icon: React.ReactNode }[] = [
  { key: "ascii", label: "ASCII", icon: <AlignLeft size={11} /> },
  { key: "markdown", label: "Markdown", icon: <FileText size={11} /> },
  { key: "json", label: "JSON", icon: <Braces size={11} /> },
  { key: "yaml", label: "YAML", icon: <Code2 size={11} /> },
  { key: "flat", label: "Flat", icon: <List size={11} /> },
  { key: "csv", label: "CSV", icon: <FileSpreadsheet size={11} /> },
  { key: "html", label: "HTML", icon: <FileCode2 size={11} /> },
  { key: "mermaid", label: "Mermaid", icon: <GitBranch size={11} /> },
  { key: "treemap", label: "Treemap", icon: <Squircle size={11} /> },
];

export default function OutputTabs() {
  const format = useStore((s) => s.format);
  const setFormat = useStore((s) => s.setFormat);
  return (
    <div className="flex gap-1 min-w-0">
      {TABS.map((t) => {
        const active = format === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setFormat(t.key)}
            title={t.label}
            className={clsx("h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all cursor-default flex items-center gap-1.5 shrink-0 whitespace-nowrap")}
            style={{
              background: active ? "var(--color-cyan-dim)" : "transparent",
              border: active ? "1px solid var(--color-accent-3)" : "1px solid transparent",
              color: active ? "var(--color-text)" : "var(--color-text-muted)",
            }}
          >
            {t.icon}
            <span className="hidden xl:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
