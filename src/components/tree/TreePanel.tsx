import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FolderTree, CheckSquare, Square, ChevronsUpDown, ChevronsDownUp } from "lucide-react";
import { useStore } from "../../store";
import TreeRow, { type RowInfo } from "./TreeRow";
import Button from "../common/Button";

export default function TreePanel() {
  const nodes = useStore((s) => s.nodes);
  const childIndex = useStore((s) => s.childIndex);
  const customOrder = useStore((s) => s.customOrder);
  const rootId = useStore((s) => s.rootId);
  const expanded = useStore((s) => s.expanded);
  const selectAll = useStore((s) => s.selectAll);
  const deselectAll = useStore((s) => s.deselectAll);
  const expandAll = useStore((s) => s.expandAll);
  const collapseAll = useStore((s) => s.collapseAll);
  const checkedSize = useStore((s) => s.checked.size);
  const status = useStore((s) => s.status);

  const rows = useMemo<RowInfo[]>(() => {
    if (!rootId) return [];
    const out: RowInfo[] = [];
    const stack: RowInfo[] = [{ id: rootId, depth: 0 }];
    while (stack.length) {
      const cur = stack.pop()!;
      out.push(cur);
      if (expanded.has(cur.id)) {
        const kids = customOrder.get(cur.id) ?? childIndex.get(cur.id) ?? [];
        for (let i = kids.length - 1; i >= 0; i--) {
          stack.push({ id: kids[i], depth: cur.depth + 1 });
        }
      }
    }
    return out;
  }, [rootId, childIndex, customOrder, expanded, nodes]);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 22,
    overscan: 12,
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <FolderTree size={13} style={{ color: "var(--color-accent-3)" }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--color-text-muted)" }}>
            Tree
          </span>
          {checkedSize > 0 && (
            <span className="mono text-[10px] px-1.5 py-0.5 rounded-md"
              style={{ background: "var(--color-cyan-dim)", color: "var(--color-accent-3)" }}>
              {checkedSize}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" icon={<ChevronsUpDown size={11} />} onClick={expandAll} title="Expand all" />
          <Button size="sm" variant="ghost" icon={<ChevronsDownUp size={11} />} onClick={collapseAll} title="Collapse all" />
          <Button size="sm" variant="ghost" icon={<CheckSquare size={11} />} onClick={selectAll} title="Select all" />
          <Button size="sm" variant="ghost" icon={<Square size={11} />} onClick={deselectAll} title="Deselect all" />
        </div>
      </div>
      <div ref={parentRef} className="flex-1 overflow-auto min-h-0">
        {rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[12px] px-6 text-center"
            style={{ color: "var(--color-text-subtle)" }}>
            {status === "scanning"
              ? "Scanning…"
              : "Pick a folder to begin."}
          </div>
        ) : (
          <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative", width: "100%" }}>
            {virtualizer.getVirtualItems().map((vi) => {
              const row = rows[vi.index];
              return (
                <TreeRow
                  key={vi.key}
                  info={row}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${vi.size}px`,
                    transform: `translateY(${vi.start}px)`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
