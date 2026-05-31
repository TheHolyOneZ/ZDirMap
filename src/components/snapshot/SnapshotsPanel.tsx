import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, GitCompareArrows, Trash2, X, FolderInput } from "lucide-react";
import { useStore } from "../../store";
import { listSnapshots, loadSnapshot, deleteSnapshot } from "../../ipc/commands";
import { relativeTime } from "../../lib/filesize";

interface Props { open: boolean; onClose: () => void }

export default function SnapshotsPanel({ open, onClose }: Props) {
  const snapshots = useStore((s) => s.snapshots);
  const setSnapshots = useStore((s) => s.setSnapshots);
  const setDiffAgainst = useStore((s) => s.setDiffAgainst);
  const addToast = useStore((s) => s.addToast);

  useEffect(() => {
    if (open) listSnapshots().then(setSnapshots).catch(() => {});
  }, [open]);

  const onDiff = async (file: string) => {
    try {
      const snap = await loadSnapshot(file);
      setDiffAgainst(snap);
      addToast({ type: "info", message: `Diffing against ${snap.name}` });
      onClose();
    } catch (e: any) {
      addToast({ type: "error", message: e?.message ?? "Failed to load snapshot" });
    }
  };

  const onDelete = async (file: string) => {
    try {
      await deleteSnapshot(file);
      const next = await listSnapshots();
      setSnapshots(next);
    } catch (e: any) {
      addToast({ type: "error", message: e?.message ?? "Delete failed" });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-30"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 360, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 right-0 bottom-0 z-40 w-[380px] flex flex-col"
            style={{
              background: "var(--color-bg-elev)",
              borderLeft: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <Camera size={13} style={{ color: "var(--color-accent-3)" }} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--color-text-muted)" }}>
                  Snapshots
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-md flex items-center justify-center cursor-default"
                style={{ color: "var(--color-text-subtle)" }}
              >
                <X size={11} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3 flex flex-col gap-2">
              {snapshots.length === 0 ? (
                <div className="text-[12px] px-3 py-6 text-center" style={{ color: "var(--color-text-subtle)" }}>
                  No snapshots yet. Hit “Snapshot” in the toolbar after a scan.
                </div>
              ) : (
                snapshots.map((s) => (
                  <div
                    key={s.id}
                    className="glass p-3 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium truncate" style={{ color: "var(--color-text)" }}>
                        {s.name}
                      </span>
                      <span className="text-[10px] mono" style={{ color: "var(--color-text-subtle)" }}>
                        {relativeTime(s.createdAt)}
                      </span>
                    </div>
                    <div className="text-[10px] mono truncate" style={{ color: "var(--color-text-muted)" }}>
                      {s.root}
                    </div>
                    <div className="text-[10px]" style={{ color: "var(--color-text-subtle)" }}>
                      {s.nodeCount.toLocaleString()} nodes
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        onClick={() => onDiff(s.file)}
                        className="h-6 px-2 rounded-md text-[10px] font-medium cursor-default flex items-center gap-1"
                        style={{ background: "var(--color-cyan-dim)", color: "var(--color-accent-3)" }}
                      >
                        <GitCompareArrows size={10} />
                        Diff
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const snap = await loadSnapshot(s.file);
                            const st = useStore.getState();
                            st._scanStarted("snapshot-" + snap.id, snap.root);
                            st.upsertNodes(snap.nodes);
                            st._scanDone({ nodes: snap.nodes.length, bytes: 0, durationMs: 0, warnings: [] });
                            if (snap.selection?.checked) {
                              const checked = new Set(snap.selection.checked);
                              const comments = new Map<string, string>(Object.entries(snap.selection.comments ?? {}));
                              useStore.setState({ checked, comments });
                            }
                            addToast({ type: "success", message: `Loaded ${snap.name}` });
                            onClose();
                          } catch (e: any) {
                            addToast({ type: "error", message: e?.message ?? "Load failed" });
                          }
                        }}
                        className="h-6 px-2 rounded-md text-[10px] font-medium cursor-default flex items-center gap-1"
                        style={{ background: "var(--color-panel)", color: "var(--color-text-muted)" }}
                      >
                        <FolderInput size={10} />
                        Load
                      </button>
                      <span className="flex-1" />
                      <button
                        onClick={() => onDelete(s.file)}
                        className="h-6 w-6 rounded-md flex items-center justify-center cursor-default"
                        style={{ color: "var(--color-text-subtle)" }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
