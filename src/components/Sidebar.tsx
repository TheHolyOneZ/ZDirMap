import { useState } from "react";
import { Filter, Camera, Sliders } from "lucide-react";
import PathPicker from "./PathPicker";
import ScanProgressBar from "./ScanProgressBar";
import FilterToggles from "./tree/FilterToggles";
import DepthSlider from "./tree/DepthSlider";
import OutputOptions from "./output/OutputOptions";
import SnapshotsPanel from "./snapshot/SnapshotsPanel";
import PresetsPanel from "./tree/PresetsPanel";
import { useStore } from "../store";
import clsx from "clsx";

function ScanFlag({ k, label }: { k: "useDefaults" | "useGitignore" | "includeHidden" | "followSymlinks" | "computeLines"; label: string }) {
  const v = useStore((s) => s.scanOptions[k]);
  const set = useStore((s) => s.setScanOption);
  return (
    <button
      onClick={() => set(k, !v)}
      className={clsx("h-7 px-2.5 rounded-lg text-[11px] font-medium cursor-default transition-all")}
      style={{
        background: v ? "var(--color-cyan-dim)" : "var(--color-panel)",
        border: v ? "1px solid var(--color-accent-3)" : "1px solid var(--color-border)",
        color: v ? "var(--color-text)" : "var(--color-text-muted)",
      }}
    >
      {label}
    </button>
  );
}

export default function Sidebar() {
  const [snapsOpen, setSnapsOpen] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);

  return (
    <>
      <aside
        className="w-[280px] shrink-0 flex flex-col h-full min-h-0 overflow-y-auto"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <div className="p-4 flex flex-col gap-5">
          <PathPicker />
          <ScanProgressBar />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: "var(--color-text-subtle)" }}>
              <Filter size={10} />
              Scan flags
            </div>
            <div className="flex flex-wrap gap-1.5">
              <ScanFlag k="useDefaults" label="Smart ignore" />
              <ScanFlag k="useGitignore" label=".gitignore" />
              <ScanFlag k="includeHidden" label="Show hidden" />
              <ScanFlag k="followSymlinks" label="Symlinks" />
              <ScanFlag k="computeLines" label="Count lines" />
            </div>
          </div>

          <DepthSlider />
          <FilterToggles />
          <OutputOptions />

          <div className="flex gap-1.5 pt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
            <button
              onClick={() => setPresetsOpen(true)}
              className="flex-1 h-8 rounded-lg text-[11px] font-medium cursor-default flex items-center justify-center gap-1.5 transition-all"
              style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
            >
              <Sliders size={11} />
              Presets
            </button>
            <button
              onClick={() => setSnapsOpen(true)}
              className="flex-1 h-8 rounded-lg text-[11px] font-medium cursor-default flex items-center justify-center gap-1.5 transition-all"
              style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
            >
              <Camera size={11} />
              Snapshots
            </button>
          </div>
        </div>
      </aside>
      <PresetsPanel open={presetsOpen} onClose={() => setPresetsOpen(false)} />
      <SnapshotsPanel open={snapsOpen} onClose={() => setSnapsOpen(false)} />
    </>
  );
}
