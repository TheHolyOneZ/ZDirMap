import { motion } from "motion/react";
import { useStore } from "../store";
import { humanSize } from "../lib/filesize";

export default function ScanProgressBar() {
  const status = useStore((s) => s.status);
  const progress = useStore((s) => s.progress);
  const totals = useStore((s) => s.totals);
  const warnings = useStore((s) => s.warnings);

  if (status === "idle") return null;

  const isScanning = status === "scanning";
  const label =
    status === "scanning" ? "Scanning…" :
    status === "done" ? "Done" :
    status === "cancelled" ? "Cancelled" :
    "Error";

  const accent =
    status === "scanning" ? "var(--color-accent-3)" :
    status === "done" ? "var(--color-success)" :
    status === "cancelled" ? "var(--color-warning)" :
    "var(--color-error)";

  return (
    <div className="flex flex-col gap-1 px-1">
      <div className="flex items-center justify-between text-[10px] mono" style={{ color: "var(--color-text-muted)" }}>
        <span style={{ color: accent }}>{label}</span>
        <span>
          {isScanning
            ? `${progress.count.toLocaleString()} items`
            : `${totals.nodes.toLocaleString()} items · ${humanSize(totals.bytes)} · ${totals.durationMs}ms`}
        </span>
      </div>
      <div
        className="h-[2px] rounded-full overflow-hidden"
        style={{ background: "var(--color-border)" }}
      >
        {isScanning ? (
          <motion.div
            className="h-full"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, width: "40%" }}
            animate={{ x: ["-40%", "260%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <div className="h-full" style={{ background: accent, width: "100%" }} />
        )}
      </div>
      {isScanning && progress.currentPath && (
        <div className="text-[10px] mono truncate" style={{ color: "var(--color-text-subtle)" }}>
          {progress.currentPath}
        </div>
      )}
      {warnings.length > 0 && status !== "scanning" && (
        <div className="text-[10px]" style={{ color: "var(--color-warning)" }}>
          {warnings.length} warning{warnings.length === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}
