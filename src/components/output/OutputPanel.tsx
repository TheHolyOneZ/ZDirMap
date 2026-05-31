import OutputTabs from "./OutputTabs";
import OutputViewerText from "./OutputViewerText";
import OutputViewerTreemap from "./OutputViewerTreemap";
import ExportBar from "../export/ExportBar";
import SnapshotDiffView from "../snapshot/SnapshotDiffView";
import { useStore } from "../../store";

export default function OutputPanel() {
  const format = useStore((s) => s.format);

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div className="flex items-center justify-between gap-2 px-3 py-2 shrink-0 min-w-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex-1 min-w-0 overflow-x-auto">
          <OutputTabs />
        </div>
        <ExportBar />
      </div>
      <div className="flex-1 min-h-0 relative">
        {format === "treemap" ? <OutputViewerTreemap /> : <OutputViewerText format={format} />}
        <SnapshotDiffView />
      </div>
    </div>
  );
}
