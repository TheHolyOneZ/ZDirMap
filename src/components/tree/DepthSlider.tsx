import { useStore } from "../../store";

export default function DepthSlider() {
  const depthCap = useStore((s) => s.options.depthCap);
  const setOption = useStore((s) => s.setOption);
  const maxDepth = useStore((s) => s.scanOptions.maxDepth);
  const setScanOption = useStore((s) => s.setScanOption);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: "var(--color-text-subtle)" }}>
        Depth
      </div>
      <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--color-text-muted)" }}>
        <span>Scan depth</span>
        <span className="mono">{maxDepth ?? "∞"}</span>
      </div>
      <input
        type="range"
        min={0}
        max={20}
        value={maxDepth ?? 20}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          setScanOption("maxDepth", v >= 20 ? null : v);
        }}
        className="zdm-slider"
      />
      <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--color-text-muted)" }}>
        <span>Output cap</span>
        <span className="mono">{depthCap ?? "∞"}</span>
      </div>
      <input
        type="range"
        min={0}
        max={20}
        value={depthCap ?? 20}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          setOption("depthCap", v >= 20 ? null : v);
        }}
        className="zdm-slider"
      />
      <style>{`
        .zdm-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 999px;
          background: var(--color-border);
          outline: none;
        }
        .zdm-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--color-accent-3);
          cursor: grab;
          box-shadow: 0 0 0 3px var(--color-cyan-dim);
        }
      `}</style>
    </div>
  );
}
