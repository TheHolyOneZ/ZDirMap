import { useEffect, useRef } from "react";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";
import TreePanel from "./components/tree/TreePanel";
import OutputPanel from "./components/output/OutputPanel";
import ToastHost from "./components/common/ToastHost";
import ResizeEdges from "./components/common/ResizeEdges";
import { useStore } from "./store";
import {
  onScanProgress,
  onScanNodes,
  onScanSizes,
  onScanLines,
  onScanDone,
  onScanError,
  onScanCancelled,
} from "./ipc/events";

export default function App() {
  const _scanProgress = useStore((s) => s._scanProgress);
  const upsertNodes = useStore((s) => s.upsertNodes);
  const applySizes = useStore((s) => s.applySizes);
  const applyLines = useStore((s) => s.applyLines);
  const _scanDone = useStore((s) => s._scanDone);
  const _scanError = useStore((s) => s._scanError);
  const _scanCancelled = useStore((s) => s._scanCancelled);
  const addToast = useStore((s) => s.addToast);

  const unlisten = useRef<Array<() => void>>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      onScanProgress((p) => _scanProgress({ count: p.scannedCount, currentPath: p.currentPath, elapsedMs: p.elapsedMs })),
      onScanNodes((p) => upsertNodes(p.nodes)),
      onScanSizes((p) => applySizes(p.sizes)),
      onScanLines((p) => applyLines(p.lines)),
      onScanDone((p) => {
        _scanDone({ nodes: p.totalNodes, bytes: p.totalBytes, durationMs: p.durationMs, warnings: p.warnings });
        addToast({
          type: "success",
          message: `Scanned ${p.totalNodes.toLocaleString()} items in ${p.durationMs}ms`,
        });
      }),
      onScanError((p) => {
        _scanError(p.message);
        addToast({ type: "error", message: p.message });
      }),
      onScanCancelled(() => {
        _scanCancelled();
        addToast({ type: "warning", message: "Scan cancelled" });
      }),
    ]).then((fns) => {
      if (cancelled) {
        fns.forEach((f) => f());
        return;
      }
      unlisten.current = fns;
    });

    return () => {
      cancelled = true;
      unlisten.current.forEach((f) => f());
      unlisten.current = [];
    };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex flex-1 min-h-0 min-w-0 p-3 gap-3">
          <section className="flex-1 min-w-0 min-h-0 glass overflow-hidden">
            <TreePanel />
          </section>
          <section className="flex-[1.4] min-w-0 min-h-0 glass overflow-hidden">
            <OutputPanel />
          </section>
        </main>
      </div>
      <ToastHost />
      <ResizeEdges />
    </div>
  );
}
