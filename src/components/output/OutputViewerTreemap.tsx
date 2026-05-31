import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useStore, selectFormatCtx } from "../../store";
import { layoutTreemap } from "../../lib/formatters/treemapLayout";
import { humanSize } from "../../lib/filesize";

export default function OutputViewerTreemap() {
  const ctx = useStore(useShallow(selectFormatCtx));
  const [stack, setStack] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 500 });

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const cr = e.contentRect;
        setSize({ w: Math.max(200, cr.width), h: Math.max(200, cr.height) });
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const currentRoot = stack.length ? stack[stack.length - 1] : ctx.rootId;
  const cells = useMemo(() => {
    if (!currentRoot) return [];
    return layoutTreemap(ctx, size.w, size.h, currentRoot);
  }, [ctx, size, currentRoot]);

  const rootNode = currentRoot ? ctx.nodes.get(currentRoot) : null;

  const breadcrumb: string[] = [];
  let cur: string | null | undefined = currentRoot;
  while (cur) {
    const n: any = ctx.nodes.get(cur);
    if (!n) break;
    breadcrumb.unshift(n.name);
    cur = n.parentId;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
        {stack.length > 0 && (
          <button
            onClick={() => setStack((s) => s.slice(0, -1))}
            className="h-6 w-6 rounded-md flex items-center justify-center cursor-default"
            style={{ background: "var(--color-panel)", color: "var(--color-text-muted)" }}
          >
            <ChevronLeft size={12} />
          </button>
        )}
        <div className="text-[11px] mono truncate" style={{ color: "var(--color-text-muted)" }}>
          {breadcrumb.join(" / ")}
          {rootNode && <> · <span style={{ color: "var(--color-accent-3)" }}>{humanSize(rootNode.size)}</span></>}
        </div>
        {hovered && (
          <div className="ml-auto text-[11px] mono truncate" style={{ color: "var(--color-text-subtle)" }}>
            {hovered}
          </div>
        )}
      </div>
      <div ref={ref} className="flex-1 min-h-0 relative">
        {cells.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[12px]" style={{ color: "var(--color-text-subtle)" }}>
            No content to map.
          </div>
        ) : (
          <svg width={size.w} height={size.h} style={{ display: "block" }}>
            {cells.map((c) => (
              <g
                key={c.id}
                onMouseEnter={() => {
                  const n = ctx.nodes.get(c.id);
                  setHovered(n ? `${n.relPath} — ${humanSize(n.size)}` : c.name);
                }}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  if (c.isDir) setStack((s) => [...s, c.id]);
                }}
                style={{ cursor: c.isDir ? "pointer" : "default" }}
              >
                <rect
                  x={c.x0}
                  y={c.y0}
                  width={c.x1 - c.x0}
                  height={c.y1 - c.y0}
                  fill={c.color}
                  opacity={c.isDir ? 0.85 : 0.75}
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth={0.5}
                />
                {c.x1 - c.x0 > 60 && c.y1 - c.y0 > 18 && (
                  <text
                    x={c.x0 + 4}
                    y={c.y0 + 12}
                    fontSize={10}
                    fontFamily="Inter, system-ui, sans-serif"
                    fill="rgba(0,0,0,0.78)"
                  >
                    {c.name}
                  </text>
                )}
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}
