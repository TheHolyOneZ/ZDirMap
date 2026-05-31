import { FolderOpen, X } from "lucide-react";
import { useStore } from "../store";
import { pickPath, startScan, cancelScan } from "../ipc/commands";
import Button from "./common/Button";

export default function PathPicker() {
  const root = useStore((s) => s.root);
  const status = useStore((s) => s.status);
  const scanId = useStore((s) => s.scanId);
  const scanOptions = useStore((s) => s.scanOptions);
  const _scanStarted = useStore((s) => s._scanStarted);
  const addToast = useStore((s) => s.addToast);

  const pick = async () => {
    try {
      const p = await pickPath();
      if (!p) return;
      const id = await startScan(p, scanOptions);
      _scanStarted(id, p);
    } catch (e: any) {
      addToast({ type: "error", message: e?.message ?? "Failed to start scan" });
    }
  };

  const stop = async () => {
    if (!scanId) return;
    try { await cancelScan(scanId); } catch {}
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: "var(--color-text-subtle)" }}>
        Source
      </div>
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] truncate"
        style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
        title={root ?? ""}
      >
        <FolderOpen size={13} style={{ color: "var(--color-accent-3)" }} />
        <span className="truncate flex-1 mono">{root ?? "no folder selected"}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={pick} icon={<FolderOpen size={12} />} className="flex-1">
          {root ? "Change" : "Pick folder"}
        </Button>
        {status === "scanning" && (
          <Button variant="danger" size="sm" onClick={stop} icon={<X size={12} />}>
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
