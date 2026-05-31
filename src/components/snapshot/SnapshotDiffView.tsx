import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, ArrowLeftRight, X } from "lucide-react";
import { useStore } from "../../store";
import { diffSnapshots } from "../../lib/diff";
import { humanSize } from "../../lib/filesize";
import type { Snapshot } from "../../types/domain";

export default function SnapshotDiffView() {
  const diffAgainst = useStore((s) => s.diffAgainst);
  const setDiffAgainst = useStore((s) => s.setDiffAgainst);
  const root = useStore((s) => s.root);
  const nodes = useStore((s) => s.nodes);
  const checked = useStore((s) => s.checked);
  const comments = useStore((s) => s.comments);
  const format = useStore((s) => s.format);
  const options = useStore((s) => s.options);

  const diff = useMemo(() => {
    if (!diffAgainst) return null;
    const current: Snapshot = {
      version: 1,
      id: "current",
      name: "current",
      createdAt: Math.floor(Date.now() / 1000),
      root: root ?? "",
      outputFormat: format,
      outputOptions: options,
      selection: {
        checked: [...checked],
        comments: Object.fromEntries(comments),
      },
      nodes: [...nodes.values()],
    };
    return diffSnapshots(diffAgainst, current);
  }, [diffAgainst, nodes, root, checked, comments, format, options]);

  return (
    <AnimatePresence>
      {diffAgainst && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-20 flex flex-col"
          style={{ background: "var(--color-bg-elev)" }}
        >
          <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-2">
              <ArrowLeftRight size={13} style={{ color: "var(--color-accent-3)" }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--color-text-muted)" }}>
                Diff
              </span>
              <span className="text-[11px] mono truncate" style={{ color: "var(--color-text-muted)" }}>
                {diffAgainst.name} → current
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] mono" style={{ color: "var(--color-text-subtle)" }}>
              {diff && (
                <>
                  <span style={{ color: "var(--color-success)" }}>+{diff.filter((d) => d.kind === "added").length}</span>
                  <span style={{ color: "var(--color-error)" }}>−{diff.filter((d) => d.kind === "removed").length}</span>
                  <span style={{ color: "var(--color-warning)" }}>~{diff.filter((d) => d.kind === "changed").length}</span>
                </>
              )}
              <button
                onClick={() => setDiffAgainst(null)}
                className="w-6 h-6 rounded-md flex items-center justify-center cursor-default"
                style={{ color: "var(--color-text-subtle)" }}
              >
                <X size={11} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto mono text-[12px] leading-[1.5]">
            {diff && diff.length === 0 ? (
              <div className="h-full flex items-center justify-center" style={{ color: "var(--color-text-subtle)" }}>
                Identical.
              </div>
            ) : (
              diff?.map((d, i) => {
                const accent =
                  d.kind === "added" ? "var(--color-success)" :
                  d.kind === "removed" ? "var(--color-error)" :
                  "var(--color-warning)";
                const Icon = d.kind === "added" ? Plus : d.kind === "removed" ? Minus : ArrowLeftRight;
                const sizeDelta =
                  d.kind === "changed" && d.before && d.after
                    ? d.after.size - d.before.size
                    : 0;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1 zdm-diff-row"
                    style={{ borderLeft: `2px solid ${accent}` }}
                  >
                    <Icon size={10} style={{ color: accent, flexShrink: 0 }} />
                    <span className="truncate flex-1" style={{ color: "var(--color-text)" }}>
                      {d.path}{d.isDir ? "/" : ""}
                    </span>
                    {d.kind === "changed" && sizeDelta !== 0 && (
                      <span className="text-[10px]" style={{ color: sizeDelta > 0 ? "var(--color-success)" : "var(--color-error)" }}>
                        {sizeDelta > 0 ? "+" : ""}{humanSize(Math.abs(sizeDelta))}
                      </span>
                    )}
                    {(d.kind === "added" && d.after) && (
                      <span className="text-[10px]" style={{ color: "var(--color-text-subtle)" }}>
                        {humanSize(d.after.size)}
                      </span>
                    )}
                    {(d.kind === "removed" && d.before) && (
                      <span className="text-[10px]" style={{ color: "var(--color-text-subtle)" }}>
                        {humanSize(d.before.size)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
            <style>{`.zdm-diff-row:hover { background: var(--color-panel); }`}</style>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
